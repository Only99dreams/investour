const User = require('../models/User');
const Group = require('../models/Group');
const Firm = require('../models/Firm');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const { validateHoneypot, validateCaptcha, ipThrottling } = require('../config/security');
const { generateOTP, verifyOTP } = require('../utils/otpService');
const { sendVerificationEmail } = require('../utils/emailService');

// Login
exports.login = async (req, res) => {
  try {
    const { email, password, userType } = req.body;
     // ✅ ADD THIS VALIDATION
    if (!email || !password || !userType) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and userType are required'
      });
    }
    const cleanPassword = password.trim();
    
    let user;
    switch (userType) {
      case 'individual':
        user = await User.findOne({ email }).select('+password');
        break;
      case 'group':
        user = await Group.findOne({ contactEmail: email }).select('+password');
        break;
      case 'firm':
        user = await Firm.findOne({ businessEmail: email }).select('+password');
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid user type'
        });
    }
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }


   console.log('🔍 LOGIN ATTEMPT');
console.log('📧 Request email:', email);
console.log('📧 User email in DB:', user.email);
console.log('matchCondition:', email === user.email);
console.log('🔑 Password length:', password.length);
console.log('🔑 Password (quoted):', `"${password}"`);



    
    // Verify password
    const isMatch = await user.comparePassword(cleanPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // 👇 FETCH FULL USER DOCUMENT TO GET 'role'
    const fullUser = await User.findById(user._id); // For individual
    // For group/firm, use Group.findById or Firm.findById
    
    // 👇 HANDLE ALL USER TYPES
    let userRole = 'user';
    if (userType === 'individual') {
      userRole = fullUser?.role || 'user';
    } else 
    



    // Update last login
    user.lastLogin = new Date();
    user.loginCount += 1;
    user.ipAddress = req.ip;
    user.deviceInfo = req.headers['user-agent'];
    await user.save();
    
    // Generate JWT tokens
    const accessToken = jwt.sign(
      { id: user._id, userType: user.userType || userType, role: userRole  },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    const refreshToken = jwt.sign(
      { id: user._id, userType: user.userType || userType , role: userRole },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
    );
    
    // Set cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax', 
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax', 
      maxAge: 90 * 24 * 60 * 60 * 1000 // 90 days
    });
    
    // Return user info
    const userData = {
      id: user._id,
      fullName: user.fullName || user.groupName || user.firmName,
      email: user.email || user.contactEmail || user.businessEmail,
      phone: user.phone || user.contactPhone,
      userType: user.userType || userType,
      tier: user.tier,
      isVerified: user.isVerified,
      isCompleteProfile: user.isCompleteProfile,
      isGFE: user.isGFE,
      profilePhoto: user.profilePhoto,
      country: user.country,
      createdAt: user.createdAt,
      role: userRole
    };
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: userData,
      accessToken,
      refreshToken
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Logout
exports.logout = (req, res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
};

// Refresh token
exports.refreshToken = (req, res) => {
  const { refreshToken } = req.cookies;
  
  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token not provided'
    });
  }
  
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    
    const newAccessToken = jwt.sign(
      { id: decoded.id, userType: decoded.userType },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });
    
    res.status(200).json({
      success: true,
      message: 'Token refreshed',
      accessToken: newAccessToken
    });
    
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

// Request OTP
exports.requestOTP = async (req, res) => {
  try {
    const { phone, email, userType } = req.body;
    
    let user;
    switch (userType) {
      case 'individual':
        user = await User.findOne({ phone });
        break;
      case 'group':
        user = await Group.findOne({ contactPhone: phone });
        break;
      case 'firm':
        user = await Firm.findOne({ contactPhone: phone });
        break;
      default:
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
    
    // Generate and send OTP
    const otp = await generateOTP(phone);
    
    // Send OTP via SMS
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    await client.messages.create({
      body: `Your Investours OTP is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
    
    res.status(200).json({
      success: true,
      message: 'OTP sent successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP',
      error: error.message
    });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { phone, otp, userType } = req.body;
    
    const isValid = await verifyOTP(phone, otp);
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }
    
    // Mark phone as verified
    let user;
    switch (userType) {
      case 'individual':
        user = await User.findOne({ phone });
        if (user) {
          user.isVerified = true;
          await user.save();
        }
        break;
      case 'group':
        user = await Group.findOne({ contactPhone: phone });
        if (user) {
          user.isVerified = true;
          await user.save();
        }
        break;
      case 'firm':
        user = await Firm.findOne({ contactPhone: phone });
        if (user) {
          user.isVerified = true;
          await user.save();
        }
        break;
    }
    
    res.status(200).json({
      success: true,
      message: 'OTP verified successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP',
      error: error.message
    });
  }
};

// Request email verification
exports.requestEmailVerification = async (req, res) => {
  try {
    const { email, userType } = req.body;
    
    let user;
    switch (userType) {
      case 'individual':
        user = await User.findOne({ email });
        break;
      case 'group':
        user = await Group.findOne({ contactEmail: email });
        break;
      case 'firm':
        user = await Firm.findOne({ businessEmail: email });
        break;
      default:
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
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    
    // Save token to user
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = verificationTokenExpires;
    await user.save();
    
    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    await sendVerificationEmail(email, verificationUrl);
    
    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send verification email',
      error: error.message
    });
  }
};

// Verify email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    let user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      user = await Group.findOne({
        verificationToken: token,
        verificationTokenExpires: { $gt: Date.now() }
      });
    }
    
    if (!user) {
      user = await Firm.findOne({
        verificationToken: token,
        verificationTokenExpires: { $gt: Date.now() }
      });
    }
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }
    
    // Mark email as verified
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to verify email',
      error: error.message
    });
  }
};

