const User = require('../models/User');
const Group = require('../models/Group');
const Firm = require('../models/Firm');
const Wallet = require('../models/Wallet');
const Investment = require('../models/Investment');
const AIResult = require('../models/AIResult');
const Referral = require('../models/Referral');
const GFE = require('../models/GFE');
const Post = require('../models/Post');
const { format } = require('date-fns');

// Get dashboard overview
exports.getDashboardOverview = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    let user;
    let userType;
    
    // Determine user type and get user data
    if (req.user.userType === 'individual') {
      user = await User.findById(req.user.id);
      userType = 'individual';
    } else if (req.user.userType === 'group') {
      user = await Group.findById(req.user.id);
      userType = 'group';
    } else if (req.user.userType === 'firm') {
      user = await Firm.findById(req.user.id);
      userType = 'firm';
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid user type'
      });
    }
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get wallet information
    let wallet = await Wallet.findOne({ user: user._id });
    if (!wallet) {
      wallet = new Wallet({ user: user._id });
      await wallet.save();
    }
    
    // Get AI results
    const aiResults = await AIResult.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Get recent investments
    let investments = [];
    if (userType === 'individual') {
      investments = await Investment.find({ investors: user._id })
        .sort({ createdAt: -1 })
        .limit(5);
    } else if (userType === 'group') {
      investments = await Investment.find({ groupInvestors: user._id })
        .sort({ createdAt: -1 })
        .limit(5);
    } else if (userType === 'firm') {
      investments = await Investment.find({ firm: user._id })
        .sort({ createdAt: -1 })
        .limit(5);
    }
    
    // Get recent posts
    const recentPosts = await Post.find({ author: user._id })
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Get referral stats (if GFE)
    let referralStats = null;
    if (user.isGFE) {
      const gfe = await GFE.findOne({ user: user._id });
      if (gfe) {
        referralStats = {
          totalEarnings: gfe.totalEarnings,
          lifetimeReferredUsers: gfe.lifetimeReferredUsers,
          totalSubAffiliates: gfe.totalSubAffiliates,
          activeUsersLast30Days: gfe.activeUsersLast30Days,
          referralLink: gfe.referralLink,
          clickThroughs: gfe.clickThroughs,
          signUps: gfe.signUps,
          conversionRate: gfe.conversionRate
        };
      }
    }
    
    // Get notifications
    const notifications = []; // Implement notification system as needed
    
    res.status(200).json({
      success: true,
      message: 'Dashboard overview retrieved successfully',
      user: {
        id: user._id,
        fullName: user.fullName || user.groupName || user.firmName,
        email: user.email || user.contactEmail || user.businessEmail,
        phone: user.phone || user.contactPhone,
        userType: user.userType,
        tier: user.tier,
        isVerified: user.isVerified,
        isCompleteProfile: user.isCompleteProfile,
        isGFE: user.isGFE,
        profilePhoto: user.profilePhoto,
        country: user.country,
        createdAt: user.createdAt
      },
      wallet: {
        balance: wallet.balance,
        gemPoints: wallet.gemPoints,
        gfeBalance: wallet.gfeBalance,
        withdrawalMethod: wallet.withdrawalMethod,
        withdrawalRequests: wallet.withdrawalRequests.slice(0, 3),
        transactions: wallet.transactions.slice(0, 5)
      },
      aiResults: aiResults,
      investments: investments,
      recentPosts: recentPosts,
      referralStats: referralStats,
      notifications: notifications
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard overview',
      error: error.message
    });
  }
};

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    let user;
    let userType;
    
    // Determine user type and get user data
    if (req.user.userType === 'individual') {
      user = await User.findById(req.user.id);
      userType = 'individual';
    } else if (req.user.userType === 'group') {
      user = await Group.findById(req.user.id);
      userType = 'group';
    } else if (req.user.userType === 'firm') {
      user = await Firm.findById(req.user.id);
      userType = 'firm';
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid user type'
      });
    }
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get wallet information
    let wallet = await Wallet.findOne({ user: user._id });
    if (!wallet) {
      wallet = new Wallet({ user: user._id });
      await wallet.save();
    }
    
    // Get GFE information (if applicable)
    let gfe = null;
    if (user.isGFE) {
      gfe = await GFE.findOne({ user: user._id });
    }
    
    res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully',
      user: {
        id: user._id,
        fullName: user.fullName || user.groupName || user.firmName,
        email: user.email || user.contactEmail || user.businessEmail,
        phone: user.phone || user.contactPhone,
        userType: user.userType,
        tier: user.tier,
        isVerified: user.isVerified,
        isCompleteProfile: user.isCompleteProfile,
        isGFE: user.isGFE,
        profilePhoto: user.profilePhoto,
        country: user.country,
        createdAt: user.createdAt,
        // Individual-specific fields
        ...(userType === 'individual' && {
          dateOfBirth: user.dateOfBirth,
          residentialAddress: user.residentialAddress,
          occupation: user.occupation,
          sector: user.sector,
          institution: user.institution,
          languagesSpoken: user.languagesSpoken,
          whySigningUp: user.whySigningUp,
          gender: user.gender,
          disability: user.disability
        }),
        // Group-specific fields
        ...(userType === 'group' && {
          groupType: user.groupType,
          contactPerson: user.contactPerson,
          region: user.region,
          logo: user.logo,
          address: user.address,
          size: user.size,
          languagePreference: user.languagePreference
        }),
        // Firm-specific fields
        ...(userType === 'firm' && {
          licenseNumber: user.licenseNumber,
          licenseIssuingBody: user.licenseIssuingBody,
          licenseDocument: user.licenseDocument,
          logo: user.logo,
          description: user.description,
          address: user.address,
          website: user.website,
          sectorFocus: user.sectorFocus,
          verificationStatus: user.verificationStatus,
          approvedBy: user.approvedBy,
          approvedAt: user.approvedAt
        })
      },
      wallet: {
        balance: wallet.balance,
        gemPoints: wallet.gemPoints,
        gfeBalance: wallet.gfeBalance,
        withdrawalMethod: wallet.withdrawalMethod,
        bankAccount: wallet.bankAccount,
        withdrawalRequests: wallet.withdrawalRequests,
        transactions: wallet.transactions
      },
      gfe: gfe ? {
        totalEarnings: gfe.totalEarnings,
        gemPoints: gfe.gemPoints,
        lifetimeReferredUsers: gfe.lifetimeReferredUsers,
        totalSubAffiliates: gfe.totalSubAffiliates,
        totalSubAffiliateEarnings: gfe.totalSubAffiliateEarnings,
        activeUsersLast30Days: gfe.activeUsersLast30Days,
        impact: gfe.impact,
        referralLink: gfe.referralLink,
        qrCode: gfe.qrCode,
        clickThroughs: gfe.clickThroughs,
        signUps: gfe.signUps,
        verifiedUsers: gfe.verifiedUsers,
        subscribedUsers: gfe.subscribedUsers,
        investingUsers: gfe.investingUsers,
        conversionRate: gfe.conversionRate,
        earningsBreakdown: gfe.earningsBreakdown,
        pendingEarnings: gfe.pendingEarnings,
        paidEarnings: gfe.paidEarnings,
        withdrawalThreshold: gfe.withdrawalThreshold,
        withdrawalFeePercentage: gfe.withdrawalFeePercentage,
        withdrawalSchedule: gfe.withdrawalSchedule
      } : null
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user profile',
      error: error.message
    });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    let user;
    let userType;
    
    // Determine user type and get user data
    if (req.user.userType === 'individual') {
      user = await User.findById(req.user.id);
      userType = 'individual';
    } else if (req.user.userType === 'group') {
      user = await Group.findById(req.user.id);
      userType = 'group';
    } else if (req.user.userType === 'firm') {
      user = await Firm.findById(req.user.id);
      userType = 'firm';
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid user type'
      });
    }
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const updateData = req.body;
    
    // Update user profile based on user type
    if (userType === 'individual') {
      if (updateData.fullName) user.fullName = updateData.fullName;
      if (updateData.email) user.email = updateData.email;
      if (updateData.phone) user.phone = updateData.phone;
      if (updateData.country) user.country = updateData.country;
      if (updateData.gender) user.gender = updateData.gender;
      if (updateData.disability) user.disability = updateData.disability;
      if (updateData.profilePhoto) user.profilePhoto = updateData.profilePhoto;
      if (updateData.dateOfBirth) user.dateOfBirth = updateData.dateOfBirth;
      if (updateData.residentialAddress) user.residentialAddress = updateData.residentialAddress;
      if (updateData.occupation) user.occupation = updateData.occupation;
      if (updateData.sector) user.sector = updateData.sector;
      if (updateData.institution) user.institution = updateData.institution;
      if (updateData.languagesSpoken) user.languagesSpoken = updateData.languagesSpoken;
      if (updateData.whySigningUp) user.whySigningUp = updateData.whySigningUp;
      
      // Handle GFE agreement
      if (updateData.gfeAgreement && updateData.whySigningUp?.includes('To learn and make money as a Grassroots Financial Educator - GFE')) {
        user.isGFE = true;
        user.gfeAgreementDate = new Date();
      }
    } else if (userType === 'group') {
      if (updateData.groupName) user.groupName = updateData.groupName;
      if (updateData.groupType) user.groupType = updateData.groupType;
      if (updateData.contactPerson) user.contactPerson = updateData.contactPerson;
      if (updateData.contactPhone) user.contactPhone = updateData.contactPhone;
      if (updateData.contactEmail) user.contactEmail = updateData.contactEmail;
      if (updateData.country) user.country = updateData.country;
      if (updateData.region) user.region = updateData.region;
      if (updateData.logo) user.logo = updateData.logo;
      if (updateData.address) user.address = updateData.address;
      if (updateData.size) user.size = updateData.size;
      if (updateData.languagePreference) user.languagePreference = updateData.languagePreference;
      if (updateData.whySigningUp) user.whySigningUp = updateData.whySigningUp;
      
      // Handle GFE agreement
      if (updateData.gfeAgreement && updateData.whySigningUp?.includes('To learn and make money as a Grassroots Financial Educator - GFE')) {
        user.isGFE = true;
        user.gfeAgreementDate = new Date();
      }
    } else if (userType === 'firm') {
      if (updateData.firmName) user.firmName = updateData.firmName;
      if (updateData.sector) user.sector = updateData.sector;
      if (updateData.countryOfRegistration) user.countryOfRegistration = updateData.countryOfRegistration;
      if (updateData.contactPerson) user.contactPerson = updateData.contactPerson;
      if (updateData.contactTitle) user.contactTitle = updateData.contactTitle;
      if (updateData.contactPhone) user.contactPhone = updateData.contactPhone;
      if (updateData.businessEmail) user.businessEmail = updateData.businessEmail;
      if (updateData.licenseNumber) user.licenseNumber = updateData.licenseNumber;
      if (updateData.licenseIssuingBody) user.licenseIssuingBody = updateData.licenseIssuingBody;
      if (updateData.licenseDocument) user.licenseDocument = updateData.licenseDocument;
      if (updateData.logo) user.logo = updateData.logo;
      if (updateData.description) user.description = updateData.description;
      if (updateData.address) user.address = updateData.address;
      if (updateData.website) user.website = updateData.website;
      if (updateData.sectorFocus) user.sectorFocus = updateData.sectorFocus;
    }
    
    // Save updated user
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'User profile updated successfully',
      user: {
        id: user._id,
        fullName: user.fullName || user.groupName || user.firmName,
        email: user.email || user.contactEmail || user.businessEmail,
        phone: user.phone || user.contactPhone,
        userType: user.userType,
        tier: user.tier,
        isVerified: user.isVerified,
        isCompleteProfile: user.isCompleteProfile,
        isGFE: user.isGFE,
        profilePhoto: user.profilePhoto,
        country: user.country,
        createdAt: user.createdAt,
        // Individual-specific fields
        ...(userType === 'individual' && {
          dateOfBirth: user.dateOfBirth,
          residentialAddress: user.residentialAddress,
          occupation: user.occupation,
          sector: user.sector,
          institution: user.institution,
          languagesSpoken: user.languagesSpoken,
          whySigningUp: user.whySigningUp,
          gender: user.gender,
          disability: user.disability
        }),
        // Group-specific fields
        ...(userType === 'group' && {
          groupType: user.groupType,
          contactPerson: user.contactPerson,
          region: user.region,
          logo: user.logo,
          address: user.address,
          size: user.size,
          languagePreference: user.languagePreference
        }),
        // Firm-specific fields
        ...(userType === 'firm' && {
          licenseNumber: user.licenseNumber,
          licenseIssuingBody: user.licenseIssuingBody,
          licenseDocument: user.licenseDocument,
          logo: user.logo,
          description: user.description,
          address: user.address,
          website: user.website,
          sectorFocus: user.sectorFocus,
          verificationStatus: user.verificationStatus,
          approvedBy: user.approvedBy,
          approvedAt: user.approvedAt
        })
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user profile',
      error: error.message
    });
  }
};

// Get settings
exports.getSettings = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    let user;
    let userType;
    
    // Determine user type and get user data
    if (req.user.userType === 'individual') {
      user = await User.findById(req.user.id);
      userType = 'individual';
    } else if (req.user.userType === 'group') {
      user = await Group.findById(req.user.id);
      userType = 'group';
    } else if (req.user.userType === 'firm') {
      user = await Firm.findById(req.user.id);
      userType = 'firm';
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid user type'
      });
    }
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Settings retrieved successfully',
      settings: {
        notificationPreferences: {
          email: user.notificationPreferences?.email || true,
          sms: user.notificationPreferences?.sms || true,
          inApp: user.notificationPreferences?.inApp || true
        },
        darkMode: user.darkMode || false,
        language: user.preferredLanguage || 'en',
        twoFactorAuth: user.twoFactorAuth || false,
        deviceHistory: user.deviceHistory || [],
        ipRestriction: user.ipRestriction || false
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve settings',
      error: error.message
    });
  }
};

// Update settings
exports.updateSettings = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    let user;
    let userType;
    
    // Determine user type and get user data
    if (req.user.userType === 'individual') {
      user = await User.findById(req.user.id);
      userType = 'individual';
    } else if (req.user.userType === 'group') {
      user = await Group.findById(req.user.id);
      userType = 'group';
    } else if (req.user.userType === 'firm') {
      user = await Firm.findById(req.user.id);
      userType = 'firm';
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid user type'
      });
    }
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const { notificationPreferences, darkMode, language, twoFactorAuth, ipRestriction } = req.body;
    
    // Update settings
    if (notificationPreferences) {
      user.notificationPreferences = {
        email: notificationPreferences.email !== undefined ? notificationPreferences.email : (user.notificationPreferences?.email || true),
        sms: notificationPreferences.sms !== undefined ? notificationPreferences.sms : (user.notificationPreferences?.sms || true),
        inApp: notificationPreferences.inApp !== undefined ? notificationPreferences.inApp : (user.notificationPreferences?.inApp || true)
      };
    }
    
    if (darkMode !== undefined) user.darkMode = darkMode;
    if (language) user.preferredLanguage = language;
    if (twoFactorAuth !== undefined) user.twoFactorAuth = twoFactorAuth;
    if (ipRestriction !== undefined) user.ipRestriction = ipRestriction;
    
    // Save updated user
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      settings: {
        notificationPreferences: user.notificationPreferences,
        darkMode: user.darkMode,
        language: user.preferredLanguage,
        twoFactorAuth: user.twoFactorAuth,
        ipRestriction: user.ipRestriction
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update settings',
      error: error.message
    });
  }
};