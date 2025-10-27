const GFE = require('../models/GFE');
const User = require('../models/User');
const Referral = require('../models/Referral');
const Wallet = require('../models/Wallet');
const Investment = require('../models/Investment');
const { format } = require('date-fns');

// Get GFE overview
exports.getGFEOverview = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Check if user is GFE
    const user = await User.findById(req.user.id);
    if (!user.isGFE) {
      return res.status(403).json({
        success: false,
        message: 'User is not a Grassroots Financial Educator'
      });
    }
    
    // Get GFE data
    let gfe = await GFE.findOne({ user: user._id });
    if (!gfe) {
      gfe = new GFE({
        user: user._id,
        referralLink: `${process.env.FRONTEND_URL}/signup?ref=${user._id}`,
        qrCode: '' // Generate QR code as needed
      });
      await gfe.save();
    }
    
    // Get referral stats
    const referrals = await Referral.find({ referrer: user._id });
    const directReferrals = referrals.filter(r => r.level === 1);
    const indirectReferrals = referrals.filter(r => r.level === 2);
    
    // Get earnings breakdown
    const earnings = {
      onboardingBonus: 0,
      directSubscribers: 0,
      directInvestors: 0,
      indirectSubscribers: 0,
      indirectInvestors: 0,
      bonuses: 0
    };
    
    // Calculate earnings from referrals
    for (const referral of referrals) {
      for (const earning of referral.earnings) {
        switch (earning.type) {
          case 'direct_subscriber':
            earnings.directSubscribers += earning.amount;
            break;
          case 'direct_investor':
            earnings.directInvestors += earning.amount;
            break;
          case 'indirect_subscriber':
            earnings.indirectSubscribers += earning.amount;
            break;
          case 'indirect_investor':
            earnings.indirectInvestors += earning.amount;
            break;
          case 'bonus':
            earnings.bonuses += earning.amount;
            break;
        }
      }
    }
    
    // Calculate onboarding bonus (adjustable N2,000 or equivalent)
    const onboardingBonus = directReferrals.length * 2000;
    earnings.onboardingBonus = onboardingBonus;
    
    // Update GFE totals
    gfe.totalEarnings = Object.values(earnings).reduce((sum, val) => sum + val, 0);
    gfe.gemPoints = 0; // Implement gem point calculation as needed
    gfe.lifetimeReferredUsers = referrals.length;
    gfe.totalSubAffiliates = indirectReferrals.length;
    gfe.totalSubAffiliateEarnings = earnings.indirectSubscribers + earnings.indirectInvestors;
    gfe.activeUsersLast30Days = directReferrals.filter(r => {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return r.lastActivity && new Date(r.lastActivity) > thirtyDaysAgo;
    }).length;
    
    // Calculate impact (aligned with SDGs)
    gfe.impact = {
      peopleEducated: directReferrals.length,
      groupsOnboarded: 0, // Implement group tracking as needed
      communitiesReached: 0, // Implement community tracking as needed
      sdgGoals: [1, 4, 5, 8, 10] // Example SDG goals
    };
    
    // Update GFE record
    await gfe.save();
    
    res.status(200).json({
      success: true,
      message: 'GFE overview retrieved successfully',
      gfe: {
        id: gfe._id,
        user: gfe.user,
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
        earningsBreakdown: {
          onboardingBonus: earnings.onboardingBonus,
          directSubscribers: earnings.directSubscribers,
          directInvestors: earnings.directInvestors,
          indirectSubscribers: earnings.indirectSubscribers,
          indirectInvestors: earnings.indirectInvestors,
          bonuses: earnings.bonuses
        },
        pendingEarnings: gfe.pendingEarnings,
        paidEarnings: gfe.paidEarnings,
        withdrawalThreshold: gfe.withdrawalThreshold,
        withdrawalFeePercentage: gfe.withdrawalFeePercentage,
        withdrawalSchedule: gfe.withdrawalSchedule
      },
      referrals: {
        total: referrals.length,
        direct: directReferrals.length,
        indirect: indirectReferrals.length,
        active: directReferrals.filter(r => r.status === 'active').length,
        inactive: directReferrals.filter(r => r.status === 'inactive').length
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve GFE overview',
      error: error.message
    });
  }
};

// Get referral tracking
exports.getReferralTracking = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Check if user is GFE
    const user = await User.findById(req.user.id);
    if (!user.isGFE) {
      return res.status(403).json({
        success: false,
        message: 'User is not a Grassroots Financial Educator'
      });
    }
    
    // Get GFE data
    let gfe = await GFE.findOne({ user: user._id });
    if (!gfe) {
      gfe = new GFE({
        user: user._id,
        referralLink: `${process.env.FRONTEND_URL}/signup?ref=${user._id}`,
        qrCode: '' // Generate QR code as needed
      });
      await gfe.save();
    }
    
    // Get referrals
    const referrals = await Referral.find({ referrer: user._id })
      .populate('referredUser', 'fullName email phone')
      .sort({ joinedAt: -1 });
    
    // Calculate metrics
    const clickThroughs = gfe.clickThroughs;
    const signUps = gfe.signUps;
    const verifiedUsers = gfe.verifiedUsers;
    const subscribedUsers = gfe.subscribedUsers;
    const investingUsers = gfe.investingUsers;
    const conversionRate = signUps > 0 ? (investingUsers / signUps) * 100 : 0;
    
    res.status(200).json({
      success: true,
      message: 'Referral tracking retrieved successfully',
      referralTracking: {
        uniqueReferralLink: gfe.referralLink,
        qrCode: gfe.qrCode,
        clickThroughs,
        signUps,
        verifiedUsers,
        subscribedUsers,
        investingUsers,
        conversionRate: parseFloat(conversionRate.toFixed(2)),
        referrals: referrals.map(r => ({
          id: r._id,
          referredUser: {
            id: r.referredUser._id,
            fullName: r.referredUser.fullName,
            email: r.referredUser.email,
            phone: r.referredUser.phone
          },
          level: r.level,
          status: r.status,
          joinedAt: r.joinedAt,
          lastActivity: r.lastActivity,
          isSubAffiliate: r.isSubAffiliate,
          earnings: r.earnings
        }))
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve referral tracking',
      error: error.message
    });
  }
};

// Get GFE wallet
exports.getGFEWallet = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Check if user is GFE
    const user = await User.findById(req.user.id);
    if (!user.isGFE) {
      return res.status(403).json({
        success: false,
        message: 'User is not a Grassroots Financial Educator'
      });
    }
    
    // Get wallet
    let wallet = await Wallet.findOne({ user: user._id });
    if (!wallet) {
      wallet = new Wallet({ user: user._id });
      await wallet.save();
    }
    
    // Get GFE data
    let gfe = await GFE.findOne({ user: user._id });
    if (!gfe) {
      gfe = new GFE({
        user: user._id,
        referralLink: `${process.env.FRONTEND_URL}/signup?ref=${user._id}`,
        qrCode: '' // Generate QR code as needed
      });
      await gfe.save();
    }
    
    res.status(200).json({
      success: true,
      message: 'GFE wallet retrieved successfully',
      wallet: {
        balance: wallet.gfeBalance,
        pendingEarnings: gfe.pendingEarnings,
        paidEarnings: gfe.paidEarnings,
        withdrawalThreshold: gfe.withdrawalThreshold,
        withdrawalFeePercentage: gfe.withdrawalFeePercentage,
        withdrawalSchedule: gfe.withdrawalSchedule,
        bankAccount: wallet.bankAccount,
        withdrawalRequests: wallet.withdrawalRequests,
        transactions: wallet.transactions.filter(t => t.source === 'gfe')
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve GFE wallet',
      error: error.message
    });
  }
};

// Request GFE withdrawal
exports.requestGFEWithdrawal = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Check if user is GFE
    const user = await User.findById(req.user.id);
    if (!user.isGFE) {
      return res.status(403).json({
        success: false,
        message: 'User is not a Grassroots Financial Educator'
      });
    }
    
    // Get wallet
    let wallet = await Wallet.findOne({ user: user._id });
    if (!wallet) {
      wallet = new Wallet({ user: user._id });
      await wallet.save();
    }
    
    // Get GFE data
    let gfe = await GFE.findOne({ user: user._id });
    if (!gfe) {
      gfe = new GFE({
        user: user._id,
        referralLink: `${process.env.FRONTEND_URL}/signup?ref=${user._id}`,
        qrCode: '' // Generate QR code as needed
      });
      await gfe.save();
    }
    
    const { amount, method } = req.body;
    
    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }
    
    // Validate withdrawal threshold
    if (amount < gfe.withdrawalThreshold) {
      return res.status(400).json({
        success: false,
        message: `Minimum withdrawal amount is ${gfe.withdrawalThreshold}`
      });
    }
    
    // Validate available balance
    if (amount > wallet.gfeBalance) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient funds'
      });
    }
    
    // Calculate fee
    const fee = (amount * gfe.withdrawalFeePercentage) / 100;
    const netAmount = amount - fee;
    
    // Create withdrawal request
    const withdrawalRequest = {
      amount,
      method: method || 'bank',
      status: 'pending',
      fee,
      netAmount,
      createdAt: new Date()
    };
    
    wallet.withdrawalRequests.push(withdrawalRequest);
    wallet.gfeBalance -= amount;
    
    // Add transaction
    wallet.transactions.push({
      amount: amount,
      type: 'debit',
      narration: `GFE Withdrawal - ${method}`,
      source: 'gfe',
      createdAt: new Date()
    });
    
    // Save wallet
    await wallet.save();
    
    res.status(200).json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      withdrawal: {
        id: withdrawalRequest._id,
        amount,
        method: withdrawalRequest.method,
        fee,
        netAmount,
        status: withdrawalRequest.status,
        createdAt: withdrawalRequest.createdAt
      },
      wallet: {
        balance: wallet.gfeBalance,
        pendingEarnings: gfe.pendingEarnings,
        paidEarnings: gfe.paidEarnings,
        withdrawalThreshold: gfe.withdrawalThreshold,
        withdrawalFeePercentage: gfe.withdrawalFeePercentage,
        withdrawalSchedule: gfe.withdrawalSchedule,
        bankAccount: wallet.bankAccount,
        withdrawalRequests: wallet.withdrawalRequests,
        transactions: wallet.transactions.filter(t => t.source === 'gfe')
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to request GFE withdrawal',
      error: error.message
    });
  }
};

// Get GFE tools & resources
exports.getGFETools = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Check if user is GFE
    const user = await User.findById(req.user.id);
    if (!user.isGFE) {
      return res.status(403).json({
        success: false,
        message: 'User is not a Grassroots Financial Educator'
      });
    }
    
    // Get GFE data
    let gfe = await GFE.findOne({ user: user._id });
    if (!gfe) {
      gfe = new GFE({
        user: user._id,
        referralLink: `${process.env.FRONTEND_URL}/signup?ref=${user._id}`,
        qrCode: '' // Generate QR code as needed
      });
      await gfe.save();
    }
    
    res.status(200).json({
      success: true,
      message: 'GFE tools & resources retrieved successfully',
      tools: {
        downloadableKits: [
          {
            name: 'Investours GFE Flyer',
            type: 'pdf',
            url: `${process.env.FRONTEND_URL}/downloads/gfe_flyer.pdf`
          },
          {
            name: 'Investours GFE Video',
            type: 'mp4',
            url: `${process.env.FRONTEND_URL}/downloads/gfe_video.mp4`
          },
          {
            name: 'Investours GFE Logo Pack',
            type: 'zip',
            url: `${process.env.FRONTEND_URL}/downloads/gfe_logo_pack.zip`
          }
        ],
        customizedMaterials: [
          {
            name: 'Customized Poster for Your Region',
            type: 'png',
            url: `${process.env.FRONTEND_URL}/downloads/custom_poster_${user.country}.png`
          },
          {
            name: 'Localized Educational Materials',
            type: 'pdf',
            url: `${process.env.FRONTEND_URL}/downloads/localized_materials_${user.preferredLanguage}.pdf`
          }
        ],
        educationalMaterials: [
          {
            name: 'Financial Education Comics',
            type: 'pdf',
            url: `${process.env.FRONTEND_URL}/downloads/comics.pdf`
          },
          {
            name: 'Audio Lessons',
            type: 'mp3',
            url: `${process.env.FRONTEND_URL}/downloads/audio_lessons.mp3`
          }
        ],
        messageTemplates: [
          {
            type: 'WhatsApp',
            template: `Hi! I'm a Grassroots Financial Educator with Investours. We help people learn about money, protect themselves from scams, and access safe investment opportunities. Join me at ${gfe.referralLink}`
          },
          {
            type: 'SMS',
            template: `Join Investours with me! Learn about money, protect from scams, access safe investments. Sign up here: ${gfe.referralLink}`
          }
        ]
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve GFE tools & resources',
      error: error.message
    });
  }
};

// Get GFE leaderboard
exports.getGFELeaderboard = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Check if user is GFE
    const user = await User.findById(req.user.id);
    if (!user.isGFE) {
      return res.status(403).json({
        success: false,
        message: 'User is not a Grassroots Financial Educator'
      });
    }
    
    // Get top performers
    const topPerformers = await GFE.find()
      .populate('user', 'fullName country')
      .sort({ totalEarnings: -1 })
      .limit(10);
    
    // Get user's rank
    const userRank = await GFE.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $unwind: '$userDetails'
      },
      {
        $match: {
          'userDetails._id': user._id
        }
      },
      {
        $project: {
          totalEarnings: 1,
          user: '$userDetails'
        }
      }
    ]);
    
    const userPosition = await GFE.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $unwind: '$userDetails'
      },
      {
        $project: {
          totalEarnings: 1,
          user: '$userDetails'
        }
      },
      {
        $sort: { totalEarnings: -1 }
      },
      {
        $addFields: {
          rank: { $add: [{ $indexOfArray: ['$totalEarnings', '$totalEarnings'] }, 1] }
        }
      },
      {
        $match: {
          'user._id': user._id
        }
      }
    ]);
    
    // Get upcoming competitions
    const upcomingCompetitions = [
      {
        name: 'Top Referrer Challenge',
        description: 'Refer 10 users and earn ₦5,000 bonus',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        prize: '₦5,000 bonus'
      },
      {
        name: 'Community Builder Award',
        description: 'Onboard 5 groups and earn ₦10,000 bonus',
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        prize: '₦10,000 bonus'
      }
    ];
    
    // Get badges earned
    const badgesEarned = [
      {
        name: 'Community Builder',
        description: 'Onboarded 5+ users',
        icon: 'builder.png'
      },
      {
        name: 'Community Champion',
        description: 'Earned ₦10,000+ in commissions',
        icon: 'champion.png'
      }
    ];
    
    res.status(200).json({
      success: true,
      message: 'GFE leaderboard retrieved successfully',
      leaderboard: {
        topPerformers: topPerformers.map(p => ({
          id: p._id,
          user: {
            id: p.user._id,
            fullName: p.user.fullName,
            country: p.user.country
          },
          totalEarnings: p.totalEarnings,
          gemPoints: p.gemPoints,
          lifetimeReferredUsers: p.lifetimeReferredUsers,
          totalSubAffiliates: p.totalSubAffiliates
        })),
        userRank: userPosition.length > 0 ? userPosition[0].rank : 0,
        upcomingCompetitions,
        badgesEarned
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve GFE leaderboard',
      error: error.message
    });
  }
};

// Get GFE user activity insights
exports.getGFEUserActivity = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Check if user is GFE
    const user = await User.findById(req.user.id);
    if (!user.isGFE) {
      return res.status(403).json({
        success: false,
        message: 'User is not a Grassroots Financial Educator'
      });
    }
    
    // Get referrals
    const referrals = await Referral.find({ referrer: user._id })
      .populate('referredUser', 'fullName email phone joinDate status lastActivity')
      .sort({ joinedAt: -1 });
    
    res.status(200).json({
      success: true,
      message: 'GFE user activity insights retrieved successfully',
      userActivity: {
        referrals: referrals.map(r => ({
          id: r._id,
          referredUser: {
            id: r.referredUser._id,
            fullName: r.referredUser.fullName,
            email: r.referredUser.email,
            phone: r.referredUser.phone,
            joinDate: r.referredUser.joinDate,
            status: r.referredUser.status,
            lastActivity: r.referredUser.lastActivity
          },
          level: r.level,
          status: r.status,
          joinedAt: r.joinedAt,
          lastActivity: r.lastActivity,
          isSubAffiliate: r.isSubAffiliate
        }))
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve GFE user activity insights',
      error: error.message
    });
  }
};

// Get GFE support & community
exports.getGFESupport = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Check if user is GFE
    const user = await User.findById(req.user.id);
    if (!user.isGFE) {
      return res.status(403).json({
        success: false,
        message: 'User is not a Grassroots Financial Educator'
      });
    }
    
    // Get GFE data
    let gfe = await GFE.findOne({ user: user._id });
    if (!gfe) {
      gfe = new GFE({
        user: user._id,
        referralLink: `${process.env.FRONTEND_URL}/signup?ref=${user._id}`,
        qrCode: '' // Generate QR code as needed
      });
      await gfe.save();
    }
    
    res.status(200).json({
      success: true,
      message: 'GFE support & community retrieved successfully',
      support: {
        investoursSupport: {
          email: 'support@investours.com',
          phone: '+1234567890',
          hours: 'Monday-Friday, 9AM-5PM'
        },
        regionalCoordinator: {
          name: 'Regional Coordinator Name',
          email: 'regional@investours.com',
          phone: '+0987654321'
        },
        communities: [
          {
            name: 'Investours WhatsApp Community',
            url: 'https://wa.me/1234567890',
            members: 5000
          },
          {
            name: 'Investours Telegram Community',
            url: 'https://t.me/investours',
            members: 3000
          },
          {
            name: 'Investours Facebook Community',
            url: 'https://facebook.com/investours',
            members: 10000
          }
        ],
        trainingSchedule: [
          {
            date: new Date(Date.now() + 24 * 60 * 60 * 1000),
            time: '10:00 AM',
            topic: 'Introduction to Financial Education',
            instructor: 'John Doe',
            duration: '1 hour'
          },
          {
            date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            time: '2:00 PM',
            topic: 'Advanced Investment Strategies',
            instructor: 'Jane Smith',
            duration: '1.5 hours'
          }
        ]
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve GFE support & community',
      error: error.message
    });
  }
};

// Get GFE SDG impact tracker
exports.getGFESDGTracker = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Check if user is GFE
    const user = await User.findById(req.user.id);
    if (!user.isGFE) {
      return res.status(403).json({
        success: false,
        message: 'User is not a Grassroots Financial Educator'
      });
    }
    
    // Get GFE data
    let gfe = await GFE.findOne({ user: user._id });
    if (!gfe) {
      gfe = new GFE({
        user: user._id,
        referralLink: `${process.env.FRONTEND_URL}/signup?ref=${user._id}`,
        qrCode: '' // Generate QR code as needed
      });
      await gfe.save();
    }
    
    // Get SDG impact data
    const sdgImpact = {
      usersOnboarded: {
        lowIncomeGroups: 0, // Implement tracking as needed
        youthOrWomenGroups: 0, // Implement tracking as needed
        ruralAreas: 0 // Implement tracking as needed
      },
      sdgGoalsImpacted: [
        {
          goal: 1,
          name: 'No Poverty',
          badge: 'sdg1.png',
          impact: 0 // Implement impact calculation as needed
        },
        {
          goal: 4,
          name: 'Quality Education',
          badge: 'sdg4.png',
          impact: 0 // Implement impact calculation as needed
        },
        {
          goal: 5,
          name: 'Gender Equality',
          badge: 'sdg5.png',
          impact: 0 // Implement impact calculation as needed
        },
        {
          goal: 8,
          name: 'Decent Work and Economic Growth',
          badge: 'sdg8.png',
          impact: 0 // Implement impact calculation as needed
        },
        {
          goal: 10,
          name: 'Reduced Inequalities',
          badge: 'sdg10.png',
          impact: 0 // Implement impact calculation as needed
        }
      ]
    };
    
    res.status(200).json({
      success: true,
      message: 'GFE SDG impact tracker retrieved successfully',
      sdgImpact
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve GFE SDG impact tracker',
      error: error.message
    });
  }
};