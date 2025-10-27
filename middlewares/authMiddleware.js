const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Group = require('../models/Group');
const Firm = require('../models/Firm');

// Protect routes
exports.protect = async (req, res, next) => {
  try {
    // Get token from cookies or headers
    let token;
    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'You are not logged in! Please log in to get access.'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists
    let user;
    if (decoded.userType === 'individual') {
      user = await User.findById(decoded.id);
    } else if (decoded.userType === 'group') {
      user = await Group.findById(decoded.id);
    } else if (decoded.userType === 'firm') {
      user = await Firm.findById(decoded.id);
    }
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token does no longer exist.'
      });
    }
    
    // Check if user changed password after token was issued
    if (user.passwordChangedAt) {
      const changedTimestamp = parseInt(user.passwordChangedAt.getTime() / 1000, 10);
      if (decoded.iat < changedTimestamp) {
        return res.status(401).json({
          success: false,
          message: 'User recently changed password! Please log in again.'
        });
      }
    }
    
    // Grant access to protected route
    req.user = {
      id: user._id,
      userType: decoded.userType
    };
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please log in again!'
      });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Your token has expired! Please log in again.'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Something went wrong with authentication!'
    });
  }
};