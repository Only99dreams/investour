const User = require('../models/User');
const Group = require('../models/Group'); // 👈 Make sure this is imported
const Firm = require('../models/Firm');   // 👈 Make sure this is imported
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { validateHoneypot, validateCaptcha, ipThrottling } = require('../config/security');
const { generateOTP, verifyOTP } = require('../utils/otpService');
// const { sendVerificationEmail } = require('../utils/emailService'); // Disabled
const AuditLog = require('../models/AuditLog');

// Individual User Signup
exports.signupIndividual = async (req, res) => {
  try {
    validateHoneypot(req, res, async () => {
      await validateCaptcha(req, res, async () => {
        await ipThrottling(req, res, async () => {
          const {
            fullName,
            phone,
            email,
            password,
            country,
            gender,
            disability,
            referralCode,
            termsAccepted
          } = req.body;
          
          if (!fullName || !phone || !email || !password || !country || !termsAccepted) {
            return res.status(400).json({
              success: false,
              message: 'All required fields must be filled'
            });
          }
          
          const existingUser = await User.findOne({
            $or: [{ email }, { phone }]
          });
          
          if (existingUser) {
            return res.status(400).json({
              success: false,
              message: 'User with this email or phone already exists'
            });
          }
          
         // const salt = await bcrypt.genSalt(12);
          //const hashedPassword = await bcrypt.hash(password, salt);
          
          const user = new User({
            fullName,
            email,
            phone,
            password: password,
            country,
            gender: gender || 'Prefer not to say',
            disability: disability || 'Prefer not to say',
            referralCode: referralCode || '',
            userType: 'individual',
            tier: 'Free',
            isVerified: false,
            isCompleteProfile: false
          });
          
          await user.save();
          
          await AuditLog.create({
            action: 'USER_SIGNUP',
            actor: user._id,
            actorRole: 'user',
            target: user._id,
            targetModel: 'User',
            details: {
              fullName,
              email,
              phone,
              country,
              userType: 'individual'
            },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
          });
          
          const verificationToken = crypto.randomBytes(32).toString('hex');
          user.verificationToken = verificationToken;
          user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
          await user.save();

          // ✅ AUTO-VERIFY INDIVIDUAL IN DEVELOPMENT
          if (process.env.NODE_ENV === 'development') {
            user.isVerified = true;
            await user.save();
            console.log('⚠️ Individual user auto-verified in development mode');
          }
          
          res.status(201).json({
            success: true,
            message: 'User created successfully.',
            user: {
              id: user._id,
              email: user.email,
              phone: user.phone,
              fullName: user.fullName,
              country: user.country,
              userType: user.userType,
              tier: user.tier,
              isVerified: user.isVerified,
              isCompleteProfile: user.isCompleteProfile
            }
          });
        });
      });
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during signup',
      error: error.message
    });
  }
};

// Complete Individual Profile
exports.completeProfileIndividual = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const {
      dateOfBirth,
      profilePhoto,
      residentialAddress,
      occupation,
      sector,
      institution,
      languagesSpoken,
      whySigningUp,
      gfeAgreement
    } = req.body;
    
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (profilePhoto) user.profilePhoto = profilePhoto;
    if (residentialAddress) user.residentialAddress = residentialAddress;
    if (occupation) user.occupation = occupation;
    if (sector) user.sector = sector;
    if (institution) user.institution = institution;
    if (languagesSpoken) user.languagesSpoken = languagesSpoken;
    if (whySigningUp) user.whySigningUp = whySigningUp;
    
    if (gfeAgreement && whySigningUp.includes('To learn and make money as a Grassroots Financial Educator - GFE')) {
      user.isGFE = true;
      user.gfeAgreementDate = new Date();
    }
    
    user.isCompleteProfile = true;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Profile completed successfully',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        country: user.country,
        userType: user.userType,
        tier: user.tier,
        isVerified: user.isVerified,
        isCompleteProfile: user.isCompleteProfile,
        isGFE: user.isGFE,
        profilePhoto: user.profilePhoto,
        dateOfBirth: user.dateOfBirth,
        residentialAddress: user.residentialAddress,
        occupation: user.occupation,
        sector: user.sector,
        institution: user.institution,
        languagesSpoken: user.languagesSpoken,
        whySigningUp: user.whySigningUp
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while completing profile',
      error: error.message
    });
  }
};

// Group Signup
exports.signupGroup = async (req, res) => {
  try {
    validateHoneypot(req, res, async () => {
      await validateCaptcha(req, res, async () => {
        await ipThrottling(req, res, async () => {
          const {
            groupName,
            groupType,
            contactPerson,
            contactPhone,
            contactEmail,
            password, 
            country,
            region,
            referralCode,
            termsAccepted,
            authorized
          } = req.body;
          
          if (!groupName || !groupType || !contactPerson || !contactPhone || 
              !contactEmail || !password || !country || !region || !termsAccepted || !authorized) {
            return res.status(400).json({
              success: false,
              message: 'All required fields must be filled'
            });
          }
          
          const existingGroup = await Group.findOne({
            $or: [{ contactEmail }, { contactPhone }]
          });
          
          if (existingGroup) {
            return res.status(400).json({
              success: false,
              message: 'Group with this email or phone already exists'
            });
          }

          // ✅ Hash password before saving
         // const salt = await bcrypt.genSalt(12);
         // const hashedPassword = await bcrypt.hash(password, salt);
          
          const group = new Group({
            groupName,
            groupType,
            contactPerson,
            contactPhone,
            contactEmail,
            password: password,
            country,
            region,
            referralCode: referralCode || '',
            tier: 'Free',
            isVerified: false,
            isCompleteProfile: false
          });
          
          await group.save();
          
          await AuditLog.create({
            action: 'GROUP_SIGNUP',
            actor: group._id,
            actorRole: 'group',
            target: group._id,
            targetModel: 'Group',
            details: {
              groupName,
              groupType,
              contactPerson,
              contactEmail,
              contactPhone,
              country,
              region
            },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
          });
          
          const verificationToken = crypto.randomBytes(32).toString('hex');
          group.verificationToken = verificationToken;
          group.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
          await group.save();

          // ✅ AUTO-VERIFY GROUP IN DEVELOPMENT
          if (process.env.NODE_ENV === 'development') {
            group.isVerified = true;
            await group.save();
            console.log('⚠️ Group auto-verified in development mode');
          }
          
          res.status(201).json({
            success: true,
            message: 'Group created successfully.',
            group: {
              id: group._id,
              groupName: group.groupName,
              groupType: group.groupType,
              contactPerson: group.contactPerson,
              contactEmail: group.contactEmail,
              contactPhone: group.contactPhone,
              country: group.country,
              region: group.region,
              tier: group.tier,
              isVerified: group.isVerified,
              isCompleteProfile: group.isCompleteProfile
            }
          });
        });
      });
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during group signup',
      error: error.message
    });
  }
};

// Complete Group Profile
exports.completeProfileGroup = async (req, res) => {
  try {
    const { id } = req.user;
    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    const {
      logo,
      address,
      size,
      languagePreference,
      whySigningUp,
      gfeAgreement
    } = req.body;
    
    if (logo) group.logo = logo;
    if (address) group.address = address;
    if (size) group.size = size;
    if (languagePreference) group.languagePreference = languagePreference;
    if (whySigningUp) group.whySigningUp = whySigningUp;
    
    if (gfeAgreement && whySigningUp.includes('To learn and make money as a Grassroots Financial Educator - GFE')) {
      group.isGFE = true;
      group.gfeAgreementDate = new Date();
    }
    
    group.isCompleteProfile = true;
    await group.save();
    
    res.status(200).json({
      success: true,
      message: 'Group profile completed successfully',
      group: {
        id: group._id,
        groupName: group.groupName,
        groupType: group.groupType,
        contactPerson: group.contactPerson,
        contactEmail: group.contactEmail,
        contactPhone: group.contactPhone,
        country: group.country,
        region: group.region,
        tier: group.tier,
        isVerified: group.isVerified,
        isCompleteProfile: group.isCompleteProfile,
        isGFE: group.isGFE,
        logo: group.logo,
        address: group.address,
        size: group.size,
        languagePreference: group.languagePreference,
        whySigningUp: group.whySigningUp
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while completing group profile',
      error: error.message
    });
  }
};

// Firm Signup
exports.signupFirm = async (req, res) => {
  try {
    validateHoneypot(req, res, async () => {
      await validateCaptcha(req, res, async () => {
        await ipThrottling(req, res, async () => {
          const {
            firmName,
            sector,
            countryOfRegistration,
            contactPerson,
            contactTitle,
            contactPhone,
            businessEmail,
            password,
            termsAccepted,
            licensed
          } = req.body;
          
          if (!firmName || !sector || !countryOfRegistration || !contactPerson || 
              !contactTitle || !contactPhone || !businessEmail || !password || 
              !termsAccepted || !licensed) {
            return res.status(400).json({
              success: false,
              message: 'All required fields must be filled'
            });
          }
          
          const existingFirm = await Firm.findOne({
            $or: [{ businessEmail }, { contactPhone }]
          });
          
          if (existingFirm) {
            return res.status(400).json({
              success: false,
              message: 'Firm with this email or phone already exists'
            });
          }
          
          const firm = new Firm({
            firmName,
            sector,
            countryOfRegistration,
            contactPerson,
            contactTitle,
            contactPhone,
            businessEmail,
            password,
            verificationStatus: 'pending',
            isVerified: false
          });
          
          await firm.save();
          
          await AuditLog.create({
            action: 'FIRM_SIGNUP',
            actor: firm._id,
            actorRole: 'firm',
            target: firm._id,
            targetModel: 'Firm',
            details: {
              firmName,
              sector,
              countryOfRegistration,
              contactPerson,
              contactTitle,
              contactPhone,
              businessEmail
            },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
          });
          
          const verificationToken = crypto.randomBytes(32).toString('hex');
          firm.verificationToken = verificationToken;
          firm.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
          await firm.save();

          // ✅ AUTO-VERIFY FIRM IN DEVELOPMENT
          if (process.env.NODE_ENV === 'development') {
            firm.isVerified = true;
            await firm.save();
            console.log('⚠️ Firm auto-verified in development mode');
          }
          
          res.status(201).json({
            success: true,
            message: 'Firm created successfully. Your account is pending approval.',
            firm: {
              id: firm._id,
              firmName: firm.firmName,
              sector: firm.sector,
              countryOfRegistration: firm.countryOfRegistration,
              contactPerson: firm.contactPerson,
              contactTitle: firm.contactTitle,
              contactPhone: firm.contactPhone,
              businessEmail: firm.businessEmail,
              verificationStatus: firm.verificationStatus,
              isVerified: firm.isVerified
            }
          });
        });
      });
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during firm signup',
      error: error.message
    });
  }
};

// Complete Firm Profile
exports.completeProfileFirm = async (req, res) => {
  try {
    const { id } = req.user;
    const firm = await Firm.findById(id);
    if (!firm) {
      return res.status(404).json({
        success: false,
        message: 'Firm not found'
      });
    }
    
    const {
      licenseNumber,
      licenseIssuingBody,
      licenseDocument,
      logo,
      description,
      address,
      website,
      sectorFocus
    } = req.body;
    
    if (licenseNumber) firm.licenseNumber = licenseNumber;
    if (licenseIssuingBody) firm.licenseIssuingBody = licenseIssuingBody;
    if (licenseDocument) firm.licenseDocument = licenseDocument;
    if (logo) firm.logo = logo;
    if (description) firm.description = description;
    if (address) firm.address = address;
    if (website) firm.website = website;
    if (sectorFocus) firm.sectorFocus = sectorFocus;
    
    await firm.save();
    
    res.status(200).json({
      success: true,
      message: 'Firm profile completed successfully',
      firm: {
        id: firm._id,
        firmName: firm.firmName,
        sector: firm.sector,
        countryOfRegistration: firm.countryOfRegistration,
        contactPerson: firm.contactPerson,
        contactTitle: firm.contactTitle,
        contactPhone: firm.contactPhone,
        businessEmail: firm.businessEmail,
        licenseNumber: firm.licenseNumber,
        licenseIssuingBody: firm.licenseIssuingBody,
        licenseDocument: firm.licenseDocument,
        logo: firm.logo,
        description: firm.description,
        address: firm.address,
        website: firm.website,
        sectorFocus: firm.sectorFocus,
        verificationStatus: firm.verificationStatus,
        isVerified: firm.isVerified
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while completing firm profile',
      error: error.message
    });
  }
};