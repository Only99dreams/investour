// controllers/adminController.js
const User = require('../models/User');
const Group = require('../models/Group');
const Firm = require('../models/Firm');
const Post = require('../models/Post');
const Investment = require('../models/Investment');
const AIResult = require('../models/AIResult');
const Wallet = require('../models/Wallet');
const Referral = require('../models/Referral');
const GFE = require('../models/GFE');
const Advertisement = require('../models/Advertisement');
const AuditLog = require('../models/AuditLog');

// Get admin dashboard overview
exports.getAdminDashboardOverview = async (req, res) => {
  try {
    // Check if user is authenticated and has admin privileges
    if (!req.user || !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    // Get statistics
    const totalUsers = await User.countDocuments();
    const totalGroups = await Group.countDocuments();
    const totalFirms = await Firm.countDocuments();
    const totalPosts = await Post.countDocuments();
    const totalInvestments = await Investment.countDocuments();
    const totalAdvertisements = await Advertisement.countDocuments();
    const totalAIResults = await AIResult.countDocuments();
    const totalReferrals = await Referral.countDocuments();
    const totalGFEs = await GFE.countDocuments();
    
    // Get recent activities
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);
    const recentGroups = await Group.find().sort({ createdAt: -1 }).limit(5);
    const recentFirms = await Firm.find().sort({ createdAt: -1 }).limit(5);
    const recentPosts = await Post.find().sort({ createdAt: -1 }).limit(5);
    const recentInvestments = await Investment.find().sort({ createdAt: -1 }).limit(5);
    const recentAdvertisements = await Advertisement.find().sort({ createdAt: -1 }).limit(5);
    const recentAIResults = await AIResult.find().sort({ createdAt: -1 }).limit(5);
    const recentReferrals = await Referral.find().sort({ createdAt: -1 }).limit(5);
    const recentGFEs = await GFE.find().sort({ createdAt: -1 }).limit(5);
    
    // Get analytics
    const userAnalytics = {
      byGender: await User.aggregate([
        { $group: { _id: "$gender", count: { $sum: 1 } } }
      ]),
      byCountry: await User.aggregate([
        { $group: { _id: "$country", count: { $sum: 1 } } }
      ]),
      byTier: await User.aggregate([
        { $group: { _id: "$tier", count: { $sum: 1 } } }
      ]),
      byGFEStatus: await User.aggregate([
        { $group: { _id: "$isGFE", count: { $sum: 1 } } }
      ])
    };
    
    const groupAnalytics = {
      byType: await Group.aggregate([
        { $group: { _id: "$groupType", count: { $sum: 1 } } }
      ]),
      byCountry: await Group.aggregate([
        { $group: { _id: "$country", count: { $sum: 1 } } }
      ]),
      byTier: await Group.aggregate([
        { $group: { _id: "$tier", count: { $sum: 1 } } }
      ]),
      byGFEStatus: await Group.aggregate([
        { $group: { _id: "$isGFE", count: { $sum: 1 } } }
      ])
    };
    
    const firmAnalytics = {
      bySector: await Firm.aggregate([
        { $group: { _id: "$sector", count: { $sum: 1 } } }
      ]),
      byCountry: await Firm.aggregate([
        { $group: { _id: "$countryOfRegistration", count: { $sum: 1 } } }
      ]),
      byVerificationStatus: await Firm.aggregate([
        { $group: { _id: "$verificationStatus", count: { $sum: 1 } } }
      ])
    };
    
    const postAnalytics = {
      byCategory: await Post.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } }
      ]),
      byAuthorType: await Post.aggregate([
        { $group: { _id: "$authorModel", count: { $sum: 1 } } }
      ]),
      engagement: {
        totalLikes: await Post.aggregate([
          { $group: { _id: null, total: { $sum: { $size: "$likes" } } } }
        ]).then(results => results[0]?.total || 0),
        totalComments: await Post.aggregate([
          { $group: { _id: null, total: { $sum: { $size: "$comments" } } } }
        ]).then(results => results[0]?.total || 0),
        totalShares: await Post.aggregate([
          { $group: { _id: null, total: { $sum: "$shares" } } }
        ]).then(results => results[0]?.total || 0)
      }
    };
    
    const investmentAnalytics = {
      byCategory: await Investment.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } }
      ]),
      byStatus: await Investment.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
      byRiskLevel: await Investment.aggregate([
        { $group: { _id: "$riskLevel", count: { $sum: 1 } } }
      ]),
      financial: {
        totalInvested: await Investment.aggregate([
          { $group: { _id: null, total: { $sum: "$totalInvested" } } }
        ]).then(results => results[0]?.total || 0),
        totalGain: await Investment.aggregate([
          { $group: { _id: null, total: { $sum: "$totalGain" } } }
        ]).then(results => results[0]?.total || 0)
      }
    };
    
    const advertisementAnalytics = {
      byStatus: await Advertisement.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
      byTargetAudience: {
        gender: await Advertisement.aggregate([
          { $unwind: "$targetAudience.gender" },
          { $group: { _id: "$targetAudience.gender", count: { $sum: 1 } } }
        ]),
        nationality: await Advertisement.aggregate([
          { $unwind: "$targetAudience.nationality" },
          { $group: { _id: "$targetAudience.nationality", count: { $sum: 1 } } }
        ]),
        region: await Advertisement.aggregate([
          { $unwind: "$targetAudience.region" },
          { $group: { _id: "$targetAudience.region", count: { $sum: 1 } } }
        ]),
        userTier: await Advertisement.aggregate([
          { $unwind: "$targetAudience.userTier" },
          { $group: { _id: "$targetAudience.userTier", count: { $sum: 1 } } }
        ])
      },
      performance: {
        totalViews: await Advertisement.aggregate([
          { $group: { _id: null, total: { $sum: "$views" } } }
        ]).then(results => results[0]?.total || 0),
        totalClicks: await Advertisement.aggregate([
          { $group: { _id: null, total: { $sum: "$clicks" } } }
        ]).then(results => results[0]?.total || 0),
        totalLikes: await Advertisement.aggregate([
          { $group: { _id: null, total: { $sum: "$likes" } } }
        ]).then(results => results[0]?.total || 0),
        totalComments: await Advertisement.aggregate([
          { $group: { _id: null, total: { $sum: "$comments" } } }
        ]).then(results => results[0]?.total || 0),
        totalShares: await Advertisement.aggregate([
          { $group: { _id: null, total: { $sum: "$shares" } } }
        ]).then(results => results[0]?.total || 0)
      }
    };
    
    res.status(200).json({
      success: true,
      message: 'Admin dashboard overview retrieved successfully',
      overview: {
        totalUsers,
        totalGroups,
        totalFirms,
        totalPosts,
        totalInvestments,
        totalAdvertisements,
        totalAIResults,
        totalReferrals,
        totalGFEs
      },
      recentActivities: {
        recentUsers,
        recentGroups,
        recentFirms,
        recentPosts,
        recentInvestments,
        recentAdvertisements,
        recentAIResults,
        recentReferrals,
        recentGFEs
      },
      analytics: {
        userAnalytics,
        groupAnalytics,
        firmAnalytics,
        postAnalytics,
        investmentAnalytics,
        advertisementAnalytics
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin dashboard overview',
      error: error.message
    });
  }
};

// Get user management
exports.getUserManagement = async (req, res) => {
  try {
    // Check if user is authenticated and has admin privileges
    if (!req.user || !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    const {
      page = 1,
      limit = 10,
      search = '',
      userType = '',
      tier = '',
      gender = '',
      disability = '',
      role = '',
      region = '',
      country = '',
      status = ''
    } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (userType) query.userType = userType;
    if (tier) query.tier = tier;
    if (gender) query.gender = gender;
    if (disability) query.disability = disability;
    if (role) query.role = role;
    if (region) query.region = region;
    if (country) query.country = country;
    if (status) query.status = status;
    
    // Get users
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await User.countDocuments(query);
    
    res.status(200).json({
      success: true,
      message: 'User management data retrieved successfully',
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user management data',
      error: error.message
    });
  }
};

// Manage user (update, delete, block, etc.)
exports.manageUser = async (req, res) => {
  try {
    // Check if user is authenticated and has admin privileges
    if (!req.user || !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    const { id } = req.params;
    const { action, data } = req.body;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    let updatedUser;
    
    switch (action) {
      case 'update':
        // Update user data
        if (data.fullName) user.fullName = data.fullName;
        if (data.email) user.email = data.email;
        if (data.phone) user.phone = data.phone;
        if (data.country) user.country = data.country;
        if (data.gender) user.gender = data.gender;
        if (data.disability) user.disability = data.disability;
        if (data.tier) user.tier = data.tier;
        if (data.isGFE !== undefined) user.isGFE = data.isGFE;
        if (data.isVerified !== undefined) user.isVerified = data.isVerified;
        if (data.isCompleteProfile !== undefined) user.isCompleteProfile = data.isCompleteProfile;
        if (data.role) user.role = data.role;
        
        updatedUser = await user.save();
        break;
        
      case 'block':
        user.isBlocked = true;
        user.blockedAt = new Date();
        updatedUser = await user.save();
        break;
        
      case 'unblock':
        user.isBlocked = false;
        user.blockedAt = undefined;
        updatedUser = await user.save();
        break;
        
      case 'delete':
        await user.remove();
        updatedUser = null;
        break;
        
      case 'assign':
        if (data.assignAs) {
          user.assignedAs = data.assignAs;
          updatedUser = await user.save();
        } else {
          return res.status(400).json({
            success: false,
            message: 'Assign as value is required'
          });
        }
        break;
        
      case 'upgrade':
        if (data.tier) {
          user.tier = data.tier;
          updatedUser = await user.save();
        } else {
          return res.status(400).json({
            success: false,
            message: 'Tier value is required'
          });
        }
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
    }
    
    // Log admin action
    await AuditLog.create({
      action: `USER_${action.toUpperCase()}`,
      actor: req.user.id,
      actorRole: req.user.role,
      target: user._id,
      targetModel: 'User',
      details: {
        action,
        data,
        previousData: {
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          country: user.country,
          gender: user.gender,
          disability: user.disability,
          tier: user.tier,
          isGFE: user.isGFE,
          isVerified: user.isVerified,
          isCompleteProfile: user.isCompleteProfile,
          role: user.role,
          assignedAs: user.assignedAs
        }
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.status(200).json({
      success: true,
      message: `User ${action} successful`,
      user: updatedUser
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to manage user',
      error: error.message
    });
  }
};

// Get post management
exports.getPostManagement = async (req, res) => {
  try {
    // Check if user is authenticated and has admin privileges
    if (!req.user || !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    const {
      page = 1,
      limit = 10,
      category = '',
      status = '',
      author = '',
      dateFrom = '',
      dateTo = '',
      search = ''
    } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Build query
    const query = {};
    
    if (category) query.category = category;
    if (status) query.isApproved = status === 'approved';
    if (author) query.author = author;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (dateFrom) query.publishedAt = { $gte: new Date(dateFrom) };
    if (dateTo) {
      if (query.publishedAt) {
        query.publishedAt.$lte = new Date(dateTo);
      } else {
        query.publishedAt = { $lte: new Date(dateTo) };
      }
    }
    
    // Get posts
    const posts = await Post.find(query)
      .populate('author', 'fullName email')
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Post.countDocuments(query);
    
    res.status(200).json({
      success: true,
      message: 'Post management data retrieved successfully',
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve post management data',
      error: error.message
    });
  }
};

// Manage post (create, approve, reject, edit, delete, pin, etc.)
exports.managePost = async (req, res) => {
  try {
    // Check if user is authenticated and has admin privileges
    if (!req.user || !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    const { id } = req.params;
    const { action, data } = req.body;
    
    let post;
    
    if (action !== 'create') {
      post = await Post.findById(id);
      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }
    }
    
    let updatedPost;
    
    switch (action) {
      case 'create':
        // Create new post
        const newPost = new Post({
          title: data.title,
          content: data.content,
          category: data.category,
          author: req.user.id,
          authorModel: 'Admin',
          location: data.location || '',
          tags: data.tags || [],
          attachments: data.attachments || [],
          isApproved: data.isApproved || false,
          visibility: data.visibility || 'public',
          publishedAt: data.publishedAt || new Date(),
          scheduledAt: data.scheduledAt || null,
          isScheduled: data.scheduledAt ? true : false
        });
        
        updatedPost = await newPost.save();
        break;
        
      case 'approve':
        post.isApproved = true;
        post.approvedBy = req.user.id;
        post.approvedAt = new Date();
        updatedPost = await post.save();
        break;
        
      case 'reject':
        post.isApproved = false;
        post.approvedBy = req.user.id;
        post.approvedAt = new Date();
        updatedPost = await post.save();
        break;
        
      case 'edit':
        if (data.title) post.title = data.title;
        if (data.content) post.content = data.content;
        if (data.category) post.category = data.category;
        if (data.location) post.location = data.location;
        if (data.tags) post.tags = data.tags;
        if (data.attachments) post.attachments = data.attachments;
        if (data.isApproved !== undefined) post.isApproved = data.isApproved;
        if (data.visibility) post.visibility = data.visibility;
        if (data.publishedAt) post.publishedAt = data.publishedAt;
        if (data.scheduledAt) {
          post.scheduledAt = data.scheduledAt;
          post.isScheduled = true;
        }
        
        updatedPost = await post.save();
        break;
        
      case 'delete':
        await post.remove();
        updatedPost = null;
        break;
        
      case 'pin':
        post.isPinned = true;
        updatedPost = await post.save();
        break;
        
      case 'unpin':
        post.isPinned = false;
        updatedPost = await post.save();
        break;
        
      case 'block':
        post.visibility = 'admin_only';
        updatedPost = await post.save();
        break;
        
      case 'unblock':
        post.visibility = 'public';
        updatedPost = await post.save();
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
    }
    
    // Log admin action
    await AuditLog.create({
      action: `POST_${action.toUpperCase()}`,
      actor: req.user.id,
      actorRole: req.user.role,
      target: updatedPost ? updatedPost._id : id,
      targetModel: 'Post',
      details: {
        action,
        data,
        previousData: post ? {
          title: post.title,
          content: post.content,
          category: post.category,
          isApproved: post.isApproved,
          visibility: post.visibility,
          isPinned: post.isPinned
        } : null
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.status(200).json({
      success: true,
      message: `Post ${action} successful`,
      post: updatedPost
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to manage post',
      error: error.message
    });
  }
};

// Get investment management
exports.getInvestmentManagement = async (req, res) => {
  try {
    // Check if user is authenticated and has admin privileges
    if (!req.user || !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    const {
      page = 1,
      limit = 10,
      category = '',
      status = '',
      firm = '',
      dateFrom = '',
      dateTo = '',
      search = ''
    } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Build query
    const query = {};
    
    if (category) query.category = category;
    if (status) query.status = status;
    if (firm) query.firm = firm;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (dateFrom) query.createdAt = { $gte: new Date(dateFrom) };
    if (dateTo) {
      if (query.createdAt) {
        query.createdAt.$lte = new Date(dateTo);
      } else {
        query.createdAt = { $lte: new Date(dateTo) };
      }
    }
    
    // Get investments
    const investments = await Investment.find(query)
      .populate('firm', 'firmName sector')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Investment.countDocuments(query);
    
    res.status(200).json({
      success: true,
      message: 'Investment management data retrieved successfully',
      investments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve investment management data',
      error: error.message
    });
  }
};

// Manage investment (approve, reject, pause, archive, etc.)
exports.manageInvestment = async (req, res) => {
  try {
    // Check if user is authenticated and has admin privileges
    if (!req.user || !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    const { id } = req.params;
    const { action, data } = req.body;
    
    const investment = await Investment.findById(id);
    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found'
      });
    }
    
    let updatedInvestment;
    
    switch (action) {
      case 'approve':
        investment.status = 'approved';
        investment.approvedBy = req.user.id;
        investment.approvedAt = new Date();
        updatedInvestment = await investment.save();
        break;
        
      case 'reject':
        investment.status = 'rejected';
        investment.approvedBy = req.user.id;
        investment.approvedAt = new Date();
        if (data.reason) investment.internalNotes = data.reason;
        updatedInvestment = await investment.save();
        break;
        
      case 'pause':
        investment.status = 'paused';
        updatedInvestment = await investment.save();
        break;
        
      case 'resume':
        investment.status = 'approved';
        updatedInvestment = await investment.save();
        break;
        
      case 'archive':
        investment.status = 'archived';
        updatedInvestment = await investment.save();
        break;
        
      case 'edit':
        if (data.title) investment.title = data.title;
        if (data.category) investment.category = data.category;
        if (data.minimumAmount) investment.minimumAmount = data.minimumAmount;
        if (data.expectedROI) investment.expectedROI = data.expectedROI;
        if (data.duration) investment.duration = data.duration;
        if (data.paymentFrequency) investment.paymentFrequency = data.paymentFrequency;
        if (data.riskLevel) investment.riskLevel = data.riskLevel;
        if (data.description) investment.description = data.description;
        if (data.documents) investment.documents = data.documents;
        if (data.media) investment.media = data.media;
        if (data.sdgAlignment) investment.sdgAlignment = data.sdgAlignment;
        if (data.internalNotes) investment.internalNotes = data.internalNotes;
        
        updatedInvestment = await investment.save();
        break;
        
      case 'delete':
        await investment.remove();
        updatedInvestment = null;
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
    }
    
    // Log admin action
    await AuditLog.create({
      action: `INVESTMENT_${action.toUpperCase()}`,
      actor: req.user.id,
      actorRole: req.user.role,
      target: investment._id,
      targetModel: 'Investment',
      details: {
        action,
        data,
        previousData: {
          title: investment.title,
          category: investment.category,
          status: investment.status,
          minimumAmount: investment.minimumAmount,
          expectedROI: investment.expectedROI,
          duration: investment.duration,
          paymentFrequency: investment.paymentFrequency,
          riskLevel: investment.riskLevel
        }
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.status(200).json({
      success: true,
      message: `Investment ${action} successful`,
      investment: updatedInvestment
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to manage investment',
      error: error.message
    });
  }
};

// Get firm management
exports.getFirmManagement = async (req, res) => {
  try {
    // Check if user is authenticated and has admin privileges
    if (!req.user || !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    const {
      page = 1,
      limit = 10,
      sector = '',
      country = '',
      status = '',
      search = ''
    } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Build query
    const query = {};
    
    if (sector) query.sector = sector;
    if (country) query.countryOfRegistration = country;
    if (status) query.verificationStatus = status;
    if (search) {
      query.$or = [
        { firmName: { $regex: search, $options: 'i' } },
        { businessEmail: { $regex: search, $options: 'i' } },
        { contactPhone: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Get firms
    const firms = await Firm.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Firm.countDocuments(query);
    
    res.status(200).json({
      success: true,
      message: 'Firm management data retrieved successfully',
      firms,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve firm management data',
      error: error.message
    });
  }
};

// Manage firm (approve, reject, edit, etc.)
exports.manageFirm = async (req, res) => {
  try {
    // Check if user is authenticated and has admin privileges
    if (!req.user || !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    const { id } = req.params;
    const { action, data } = req.body;
    
    const firm = await Firm.findById(id);
    if (!firm) {
      return res.status(404).json({
        success: false,
        message: 'Firm not found'
      });
    }
    
    let updatedFirm;
    
    switch (action) {
      case 'approve':
        firm.verificationStatus = 'approved';
        firm.isVerified = true;
        firm.approvedBy = req.user.id;
        firm.approvedAt = new Date();
        updatedFirm = await firm.save();
        break;
        
      case 'reject':
        firm.verificationStatus = 'rejected';
        firm.isVerified = false;
        firm.approvedBy = req.user.id;
        firm.approvedAt = new Date();
        if (data.reason) firm.internalNotes = data.reason;
        updatedFirm = await firm.save();
        break;
        
      case 'edit':
        if (data.firmName) firm.firmName = data.firmName;
        if (data.sector) firm.sector = data.sector;
        if (data.countryOfRegistration) firm.countryOfRegistration = data.countryOfRegistration;
        if (data.contactPerson) firm.contactPerson = data.contactPerson;
        if (data.contactTitle) firm.contactTitle = data.contactTitle;
        if (data.contactPhone) firm.contactPhone = data.contactPhone;
        if (data.businessEmail) firm.businessEmail = data.businessEmail;
        if (data.licenseNumber) firm.licenseNumber = data.licenseNumber;
        if (data.licenseIssuingBody) firm.licenseIssuingBody = data.licenseIssuingBody;
        if (data.licenseDocument) firm.licenseDocument = data.licenseDocument;
        if (data.logo) firm.logo = data.logo;
        if (data.description) firm.description = data.description;
        if (data.address) firm.address = data.address;
        if (data.website) firm.website = data.website;
        if (data.sectorFocus) firm.sectorFocus = data.sectorFocus;
        
        updatedFirm = await firm.save();
        break;
        
      case 'delete':
        await firm.remove();
        updatedFirm = null;
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
    }
    
    // Log admin action
    await AuditLog.create({
      action: `FIRM_${action.toUpperCase()}`,
      actor: req.user.id,
      actorRole: req.user.role,
      target: firm._id,
      targetModel: 'Firm',
      details: {
        action,
        data,
        previousData: {
          firmName: firm.firmName,
          sector: firm.sector,
          countryOfRegistration: firm.countryOfRegistration,
          verificationStatus: firm.verificationStatus,
          isVerified: firm.isVerified
        }
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.status(200).json({
      success: true,
      message: `Firm ${action} successful`,
      firm: updatedFirm
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to manage firm',
      error: error.message
    });
  }
};

// Get advertisement management
exports.getAdvertisementManagement = async (req, res) => {
  try {
    // Check if user is authenticated and has admin privileges
    if (!req.user || !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    const {
      page = 1,
      limit = 10,
      status = '',
      advertiser = '',
      dateFrom = '',
      dateTo = '',
      search = ''
    } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Build query
    const query = {};
    
    if (status) query.status = status;
    if (advertiser) query.advertiser = advertiser;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (dateFrom) query.startDate = { $gte: new Date(dateFrom) };
    if (dateTo) {
      if (query.endDate) {
        query.endDate.$lte = new Date(dateTo);
      } else {
        query.endDate = { $lte: new Date(dateTo) };
      }
    }
    
    // Get advertisements
    const advertisements = await Advertisement.find(query)
      .populate('advertiser', 'fullName groupName firmName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Advertisement.countDocuments(query);
    
    res.status(200).json({
      success: true,
      message: 'Advertisement management data retrieved successfully',
      advertisements,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve advertisement management data',
      error: error.message
    });
  }
};

// Manage advertisement (approve, reject, pause, etc.)
exports.manageAdvertisement = async (req, res) => {
  try {
    // Check if user is authenticated and has admin privileges
    if (!req.user || !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    const { id } = req.params;
    const { action, data } = req.body;
    
    const advertisement = await Advertisement.findById(id);
    if (!advertisement) {
      return res.status(404).json({
        success: false,
        message: 'Advertisement not found'
      });
    }
    
    let updatedAdvertisement;
    
    switch (action) {
      case 'approve':
        advertisement.status = 'approved';
        updatedAdvertisement = await advertisement.save();
        break;
        
      case 'reject':
        advertisement.status = 'rejected';
        if (data.reason) advertisement.internalNotes = data.reason;
        updatedAdvertisement = await advertisement.save();
        break;
        
      case 'pause':
        advertisement.status = 'paused';
        updatedAdvertisement = await advertisement.save();
        break;
        
      case 'resume':
        advertisement.status = 'active';
        updatedAdvertisement = await advertisement.save();
        break;
        
      case 'complete':
        advertisement.status = 'completed';
        updatedAdvertisement = await advertisement.save();
        break;
        
      case 'edit':
        if (data.title) advertisement.title = data.title;
        if (data.description) advertisement.description = data.description;
        if (data.media) advertisement.media = data.media;
        if (data.targetAudience) advertisement.targetAudience = data.targetAudience;
        if (data.duration) advertisement.duration = data.duration;
        if (data.startDate) advertisement.startDate = data.startDate;
        if (data.endDate) advertisement.endDate = data.endDate;
        if (data.paymentMethod) advertisement.paymentMethod = data.paymentMethod;
        if (data.paymentAmount) advertisement.paymentAmount = data.paymentAmount;
        if (data.sponsorTag) advertisement.sponsorTag = data.sponsorTag;
        
        updatedAdvertisement = await advertisement.save();
        break;
        
      case 'delete':
        await advertisement.remove();
        updatedAdvertisement = null;
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
    }
    
    // Log admin action
    await AuditLog.create({
      action: `ADVERTISEMENT_${action.toUpperCase()}`,
      actor: req.user.id,
      actorRole: req.user.role,
      target: advertisement._id,
      targetModel: 'Advertisement',
      details: {
        action,
        data,
        previousData: {
          title: advertisement.title,
          status: advertisement.status,
          startDate: advertisement.startDate,
          endDate: advertisement.endDate,
          paymentStatus: advertisement.paymentStatus
        }
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.status(200).json({
      success: true,
      message: `Advertisement ${action} successful`,
      advertisement: updatedAdvertisement
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to manage advertisement',
      error: error.message
    });
  }
};

// Get GFE management
exports.getGFEManagement = async (req, res) => {
  try {
    // Check if user is authenticated and has admin privileges
    if (!req.user || !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    const {
      page = 1,
      limit = 10,
      search = '',
      region = '',
      country = '',
      gender = '',
      disability = '',
      tier = ''
    } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Build query for users who are GFEs
    const query = { isGFE: true };
    
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (region) query.region = region;
    if (country) query.country = country;
    if (gender) query.gender = gender;
    if (disability) query.disability = disability;
    if (tier) query.tier = tier;
    
    // Get GFEs
    const gfeUsers = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await User.countDocuments(query);
    
    // Get detailed GFE data
    const gfeDetails = [];
    for (const user of gfeUsers) {
      const gfe = await GFE.findOne({ user: user._id });
      gfeDetails.push({
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          country: user.country,
          gender: user.gender,
          disability: user.disability,
          tier: user.tier,
          createdAt: user.createdAt
        },
        gfe: gfe ? {
          id: gfe._id,
          totalEarnings: gfe.totalEarnings,
          gemPoints: gfe.gemPoints,
          lifetimeReferredUsers: gfe.lifetimeReferredUsers,
          totalSubAffiliates: gfe.totalSubAffiliates,
          activeUsersLast30Days: gfe.activeUsersLast30Days,
          referralLink: gfe.referralLink,
          clickThroughs: gfe.clickThroughs,
          signUps: gfe.signUps,
          conversionRate: gfe.conversionRate,
          pendingEarnings: gfe.pendingEarnings,
          paidEarnings: gfe.paidEarnings
        } : null
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'GFE management data retrieved successfully',
      gfeDetails,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve GFE management data',
      error: error.message
    });
  }
};

// Manage GFE (lock, unlock, adjust earnings, etc.)
exports.manageGFE = async (req, res) => {
  try {
    // Check if user is authenticated and has admin privileges
    if (!req.user || !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    const { id } = req.params;
    const { action, data } = req.body;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (!user.isGFE) {
      return res.status(400).json({
        success: false,
        message: 'User is not a Grassroots Financial Educator'
      });
    }
    
    const gfe = await GFE.findOne({ user: user._id });
    if (!gfe) {
      return res.status(404).json({
        success: false,
        message: 'GFE record not found'
      });
    }
    
    let updatedGFE;
    
    switch (action) {
      case 'lock':
        // Lock GFE wallet
        const wallet = await Wallet.findOne({ user: user._id });
        if (wallet) {
          wallet.isGFEWalletLocked = true;
          await wallet.save();
        }
        break;
        
      case 'unlock':
        // Unlock GFE wallet
        const wallet2 = await Wallet.findOne({ user: user._id });
        if (wallet2) {
          wallet2.isGFEWalletLocked = false;
          await wallet2.save();
        }
        break;
        
      case 'adjustEarnings':
        if (data.amount === undefined) {
          return res.status(400).json({
            success: false,
            message: 'Amount is required for earnings adjustment'
          });
        }
        
        // Adjust earnings
        gfe.totalEarnings += data.amount;
        if (data.amount > 0) {
          gfe.pendingEarnings += data.amount;
        }
        
        // Update wallet
        const wallet3 = await Wallet.findOne({ user: user._id });
        if (wallet3) {
          wallet3.gfeBalance += data.amount;
          wallet3.transactions.push({
            amount: Math.abs(data.amount),
            type: data.amount > 0 ? 'credit' : 'debit',
            narration: data.narration || 'Admin adjustment',
            source: 'gfe',
            relatedId: req.user.id,
            relatedModel: 'User',
            createdAt: new Date()
          });
          await wallet3.save();
        }
        
        updatedGFE = await gfe.save();
        break;
        
      case 'adjustGemPoints':
        if (data.amount === undefined) {
          return res.status(400).json({
            success: false,
            message: 'Amount is required for gem points adjustment'
          });
        }
        
        // Adjust gem points
        gfe.gemPoints += data.amount;
        
        // Update wallet
        const wallet4 = await Wallet.findOne({ user: user._id });
        if (wallet4) {
          wallet4.gemPoints += data.amount;
          wallet4.transactions.push({
            amount: Math.abs(data.amount),
            type: data.amount > 0 ? 'credit' : 'debit',
            narration: data.narration || 'Admin adjustment',
            source: 'gem_points',
            relatedId: req.user.id,
            relatedModel: 'User',
            createdAt: new Date()
          });
          await wallet4.save();
        }
        
        updatedGFE = await gfe.save();
        break;
        
      case 'updateSettings':
        if (data.withdrawalThreshold !== undefined) {
          gfe.withdrawalThreshold = data.withdrawalThreshold;
        }
        if (data.withdrawalFeePercentage !== undefined) {
          gfe.withdrawalFeePercentage = data.withdrawalFeePercentage;
        }
        if (data.withdrawalSchedule) {
          gfe.withdrawalSchedule = data.withdrawalSchedule;
        }
        
        updatedGFE = await gfe.save();
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
    }
    
    // Log admin action
    await AuditLog.create({
      action: `GFE_${action.toUpperCase()}`,
      actor: req.user.id,
      actorRole: req.user.role,
      target: user._id,
      targetModel: 'User',
      details: {
        action,
        data,
        previousData: {
          totalEarnings: gfe.totalEarnings,
          gemPoints: gfe.gemPoints,
          pendingEarnings: gfe.pendingEarnings,
          withdrawalThreshold: gfe.withdrawalThreshold,
          withdrawalFeePercentage: gfe.withdrawalFeePercentage,
          withdrawalSchedule: gfe.withdrawalSchedule
        }
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.status(200).json({
      success: true,
      message: `GFE ${action} successful`,
      gfe: updatedGFE
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to manage GFE',
      error: error.message
    });
  }
};

// Get referral funnel analytics
exports.getReferralFunnelAnalytics = async (req, res) => {
  try {
    // Check if user is authenticated and has admin privileges
    if (!req.user || !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    const {
      dateFrom = '',
      dateTo = '',
      region = '',
      country = '',
      gender = '',
      tier = '',
      ageGroup = ''
    } = req.query;
    
    // Build query for referrals
    const query = {};
    
    if (dateFrom) query.joinedAt = { $gte: new Date(dateFrom) };
    if (dateTo) {
      if (query.joinedAt) {
        query.joinedAt.$lte = new Date(dateTo);
      } else {
        query.joinedAt = { $lte: new Date(dateTo) };
      }
    }
    
    // Get referral funnel data
    const totalShares = await GFE.aggregate([
      { $group: { _id: null, total: { $sum: "$clickThroughs" } } }
    ]).then(results => results[0]?.total || 0);
    
    const totalClicks = await GFE.aggregate([
      { $group: { _id: null, total: { $sum: "$clickThroughs" } } }
    ]).then(results => results[0]?.total || 0);
    
    const totalSignUps = await GFE.aggregate([
      { $group: { _id: null, total: { $sum: "$signUps" } } }
    ]).then(results => results[0]?.total || 0);
    
    const totalVerifiedUsers = await GFE.aggregate([
      { $group: { _id: null, total: { $sum: "$verifiedUsers" } } }
    ]).then(results => results[0]?.total || 0);
    
    const totalSubscribedUsers = await GFE.aggregate([
      { $group: { _id: null, total: { $sum: "$subscribedUsers" } } }
    ]).then(results => results[0]?.total || 0);
    
    const totalInvestingUsers = await GFE.aggregate([
      { $group: { _id: null, total: { $sum: "$investingUsers" } } }
    ]).then(results => results[0]?.total || 0);
    
    // Get conversion rates
    const clickToSignUpRate = totalClicks > 0 ? (totalSignUps / totalClicks) * 100 : 0;
    const signUpToVerifiedRate = totalSignUps > 0 ? (totalVerifiedUsers / totalSignUps) * 100 : 0;
    const verifiedToSubscribedRate = totalVerifiedUsers > 0 ? (totalSubscribedUsers / totalVerifiedUsers) * 100 : 0;
    const subscribedToInvestingRate = totalSubscribedUsers > 0 ? (totalInvestingUsers / totalSubscribedUsers) * 100 : 0;
    
    // Get top GFEs by performance
    const topGFEs = await GFE.find()
      .populate('user', 'fullName email country gender tier')
      .sort({ totalEarnings: -1 })
      .limit(10);
    
    res.status(200).json({
      success: true,
      message: 'Referral funnel analytics retrieved successfully',
      funnel: {
        totalShares,
        totalClicks,
        totalSignUps,
        totalVerifiedUsers,
        totalSubscribedUsers,
        totalInvestingUsers,
        conversionRates: {
          clickToSignUp: parseFloat(clickToSignUpRate.toFixed(2)),
          signUpToVerified: parseFloat(signUpToVerifiedRate.toFixed(2)),
          verifiedToSubscribed: parseFloat(verifiedToSubscribedRate.toFixed(2)),
          subscribedToInvesting: parseFloat(subscribedToInvestingRate.toFixed(2))
        }
      },
      topGFEs: topGFEs.map(g => ({
        id: g._id,
        user: {
          id: g.user._id,
          fullName: g.user.fullName,
          email: g.user.email,
          country: g.user.country,
          gender: g.user.gender,
          tier: g.user.tier
        },
        totalEarnings: g.totalEarnings,
        gemPoints: g.gemPoints,
        lifetimeReferredUsers: g.lifetimeReferredUsers,
        totalSubAffiliates: g.totalSubAffiliates,
        activeUsersLast30Days: g.activeUsersLast30Days,
        clickThroughs: g.clickThroughs,
        signUps: g.signUps,
        verifiedUsers: g.verifiedUsers,
        subscribedUsers: g.subscribedUsers,
        investingUsers: g.investingUsers,
        conversionRate: g.conversionRate
      }))
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve referral funnel analytics',
      error: error.message
    });
  }
};

// Get campaign management
exports.getCampaignManagement = async (req, res) => {
  try {
    // Check if user is authenticated and has admin privileges
    if (!req.user || !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    const {
      page = 1,
      limit = 10,
      status = '',
      type = '',
      dateFrom = '',
      dateTo = '',
      search = ''
    } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Build query for campaigns (assuming campaigns are stored in a separate collection)
    const query = {};
    
    if (status) query.status = status;
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (dateFrom) query.startDate = { $gte: new Date(dateFrom) };
    if (dateTo) {
      if (query.endDate) {
        query.endDate.$lte = new Date(dateTo);
      } else {
        query.endDate = { $lte: new Date(dateTo) };
      }
    }
    
    // For this example, we'll simulate campaign data
    const campaigns = [
      {
        id: '1',
        name: 'Q1 Referral Challenge',
        description: 'Refer 10 users and earn ₦5,000 bonus',
        type: 'referral',
        status: 'active',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-03-31'),
        prize: '₦5,000 bonus',
        participants: 150,
        winners: 25
      },
      {
        id: '2',
        name: 'Climate Resilience Awareness',
        description: 'Share climate resilience content and earn gem points',
        type: 'awareness',
        status: 'completed',
        startDate: new Date('2023-02-01'),
        endDate: new Date('2023-02-28'),
        prize: '100 gem points',
        participants: 300,
        winners: 50
      }
    ];
    
    const total = campaigns.length;
    
    res.status(200).json({
      success: true,
      message: 'Campaign management data retrieved successfully',
      campaigns: campaigns.slice(skip, skip + parseInt(limit)),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve campaign management data',
      error: error.message
    });
  }
};

// Manage campaign (create, edit, activate, deactivate, etc.)
exports.manageCampaign = async (req, res) => {
  try {
    // Check if user is authenticated and has admin privileges
    if (!req.user || !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    const { id } = req.params;
    const { action, data } = req.body;
    
    // For this example, we'll simulate campaign management
    let campaign;
    
    if (action !== 'create') {
      // Find campaign by ID (in a real implementation, this would query a database)
      campaign = { id, name: 'Existing Campaign' };
    }
    
    let updatedCampaign;
    
    switch (action) {
      case 'create':
        updatedCampaign = {
          id: Date.now().toString(),
          name: data.name,
          description: data.description,
          type: data.type,
          status: 'draft',
          startDate: data.startDate,
          endDate: data.endDate,
          prize: data.prize,
          participants: 0,
          winners: 0
        };
        break;
        
      case 'activate':
        // In a real implementation, this would update the campaign status
        updatedCampaign = { ...campaign, status: 'active' };
        break;
        
      case 'deactivate':
        updatedCampaign = { ...campaign, status: 'inactive' };
        break;
        
      case 'edit':
        updatedCampaign = { ...campaign, ...data };
        break;
        
      case 'delete':
        updatedCampaign = null;
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
    }
    
    // Log admin action
    await AuditLog.create({
      action: `CAMPAIGN_${action.toUpperCase()}`,
      actor: req.user.id,
      actorRole: req.user.role,
      target: updatedCampaign ? updatedCampaign.id : id,
      targetModel: 'Campaign',
      details: {
        action,
        data,
        previousData: campaign
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.status(200).json({
      success: true,
      message: `Campaign ${action} successful`,
      campaign: updatedCampaign
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to manage campaign',
      error: error.message
    });
  }
};

// Get leaderboard management
exports.getLeaderboardManagement = async (req, res) => {
  try {
    // Check if user is authenticated and has admin privileges
    if (!req.user || !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    const {
      type = 'gfe',
      region = '',
      country = '',
      dateFrom = '',
      dateTo = ''
    } = req.query;
    
    // For this example, we'll return the top GFEs
    const topGFEs = await GFE.find()
      .populate('user', 'fullName email country gender tier')
      .sort({ totalEarnings: -1 })
      .limit(100);
    
    // Filter by region/country if specified
    let filteredGFEs = topGFEs;
    if (region || country) {
      filteredGFEs = topGFEs.filter(g => {
        if (region && g.user.region !== region) return false;
        if (country && g.user.country !== country) return false;
        return true;
      });
    }
    
    // Filter by date if specified
    if (dateFrom || dateTo) {
      // In a real implementation, this would filter by earnings within the date range
    }
    
    res.status(200).json({
      success: true,
      message: 'Leaderboard management data retrieved successfully',
      leaderboard: {
        type,
        entries: filteredGFEs.map((g, index) => ({
          rank: index + 1,
          id: g._id,
          user: {
            id: g.user._id,
            fullName: g.user.fullName,
            email: g.user.email,
            country: g.user.country,
            gender: g.user.gender,
            tier: g.user.tier
          },
          totalEarnings: g.totalEarnings,
          gemPoints: g.gemPoints,
          lifetimeReferredUsers: g.lifetimeReferredUsers,
          totalSubAffiliates: g.totalSubAffiliates,
          activeUsersLast30Days: g.activeUsersLast30Days
        }))
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve leaderboard management data',
      error: error.message
    });
  }
};

// Manage leaderboard (update visibility, rankings, etc.)
exports.manageLeaderboard = async (req, res) => {
  try {
    // Check if user is authenticated and has admin privileges
    if (!req.user || !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    const { action, data } = req.body;
    
    // For this example, we'll simulate leaderboard management
    let updatedLeaderboard;
    
    switch (action) {
      case 'updateVisibility':
        // In a real implementation, this would update leaderboard visibility settings
        updatedLeaderboard = { visibility: data.visibility };
        break;
        
      case 'recalculateRankings':
        // In a real implementation, this would recalculate all rankings
        updatedLeaderboard = { lastRecalculated: new Date() };
        break;
        
      case 'addBonus':
        // In a real implementation, this would add bonus points to specific users
        updatedLeaderboard = { bonusAdded: true, recipients: data.recipients };
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
    }
    
    // Log admin action
    await AuditLog.create({
      action: `LEADERBOARD_${action.toUpperCase()}`,
      actor: req.user.id,
      actorRole: req.user.role,
      target: 'leaderboard',
      targetModel: 'Leaderboard',
      details: {
        action,
        data
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.status(200).json({
      success: true,
      message: `Leaderboard ${action} successful`,
      leaderboard: updatedLeaderboard
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to manage leaderboard',
      error: error.message
    });
  }
};