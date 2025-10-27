🔐 Authentication Endpoints


POST
/api/auth/login
❌
User login (Individual/Group/Firm)


POST
/api/auth/logout
✅
Log out current session
POST
/api/auth/refresh-token
❌
Refresh access token using refresh token
POST
/api/auth/request-otp
❌
Request OTP for phone verification
POST
/api/auth/verify-otp
❌
Verify OTP code
POST
/api/auth/request-email-verification
❌
Request email verification link
GET
/api/auth/verify-email/:token
❌
Verify email with token

👤 User Management (Individual)
POST
/api/users/individual/signup
❌
Register new individual user
PATCH
/api/users/individual/complete-profile
✅
Complete individual profile after signup

👥 Group Management
POST
/api/users/group/signup
❌
Register new group/organization
PATCH
/api/users/group/complete-profile
✅
Complete group profile after signup

🏢 Firm Management
POST
/api/users/firm/signup
❌
Register licensed investment firm
PATCH
/api/users/firm/complete-profile
✅
Complete firm profile (upload license, etc.)
GET
/api/firms/dashboard
✅ (Firm)
Get firm dashboard overview
POST
/api/firms/investments
✅ (Firm)
Submit new investment opportunity
GET
/api/firms/investments
✅ (Firm)
Get firm's investment opportunities
GET
/api/firms/public-investments
❌
Get all vetted public investments

🏠 Dashboard & Profile
GET
/api/dashboard/overview
✅
Get user dashboard overview
GET
/api/dashboard/profile
✅
Get full user profile
PATCH
/api/dashboard/profile
✅
Update user profile
GET
/api/dashboard/settings
✅
Get user settings
PATCH
/api/dashboard/settings
✅
Update user settings

🤖 AI-Powered Services
POST
/api/ai/search
❌
AI-powered investment scam search (anonymous)
POST
/api/ai/analyze
✅
AI-powered investment analysis (requires login)
GET
/api/ai/history
✅
Get user's AI search/analyze history

🌱 Grassroots Financial Educator (GFE)
GET
/api/gfe/overview
✅ (GFE)
Get GFE dashboard overview
GET
/api/gfe/referral-tracking
✅ (GFE)
Get referral tracking metrics
GET
/api/gfe/wallet
✅ (GFE)
Get GFE wallet information
POST
/api/gfe/withdrawal
✅ (GFE)
Request GFE earnings withdrawal
GET
/api/gfe/tools
✅ (GFE)
Get GFE marketing tools & resources
GET
/api/gfe/leaderboard
✅ (GFE)
Get GFE leaderboard rankings
GET
/api/gfe/user-activity
✅ (GFE)
Get referred user activity insights
GET
/api/gfe/support
✅ (GFE)
Get GFE support & community info
GET
/api/gfe/sdg-tracker
✅ (GFE)
Get SDG impact tracking

💰 Wallet & Transactions
GET
/api/wallets
✅
Get user wallet balance & details
POST
/api/wallets/withdraw
✅
Request withdrawal from main wallet
GET
/api/wallets/transactions
✅
Get wallet transaction history

📢 Community Posts
GET
/api/posts
❌
Get all approved community posts
POST
/api/posts
✅
Create new community post
GET
/api/posts/:id
❌
Get specific post details
POST
/api/posts/:id/like
✅
Like a post
POST
/api/posts/:id/share
✅
Share a post (increments share count)

💼 Investments
GET
/api/investments
❌
Get all vetted investment opportunities
POST
/api/investments/invest
✅
Invest in an opportunity
GET
/api/investments/:id
❌
Get specific investment details

🤝 Referrals
GET
/api/referrals/track?refCode=ABC123
❌
Track referral link click (for analytics)
GET
/api/referrals/performance
✅ (GFE)
Get referral performance metrics

📣 Advertisements
GET
/api/ads
❌
Get active advertisements
POST
/api/ads
✅
Create new advertisement
GET
/api/ads/my
✅
Get user's advertisements
PATCH
/api/ads/:id
✅
Update advertisement
DELETE
/api/ads/:id
✅
Delete advertisement

🔔 Notifications
GET
/api/notifications
✅
Get user notifications
PATCH
/api/notifications/:id/read
✅
Mark notification as read
DELETE
/api/notifications/:id
✅
Delete specific notification
DELETE
/api/notifications
✅
Delete all notifications

👨‍💼 Admin Control Panel
Dashboard & Overview
GET
/api/admin/dashboard-overview
✅ (Admin)
Get admin dashboard statistics

User Management
GET
/api/admin/users
✅ (Admin)
Get paginated user list with filters
POST
/api/admin/users/:id/manage
✅ (Admin)
Manage user (update, block, delete, assign role, upgrade tier)

Post Management
GET
/api/admin/posts
✅ (Admin)
Get paginated posts with filters
POST
/api/admin/posts/:id/manage
✅ (Admin)
Manage post (create, approve, reject, edit, delete, pin, block)

Investment Management
GET
/api/admin/investments
✅ (Admin)
Get paginated investments with filters
POST
/api/admin/investments/:id/manage
✅ (Admin)
Manage investment (approve, reject, pause, archive, edit)

Firm Management
GET
/api/admin/firms
✅ (Admin)
Get paginated firms with filters
POST
/api/admin/firms/:id/manage
✅ (Admin)
Manage firm (approve, reject, edit, delete)

Advertisement Management
GET
/api/admin/advertisements
✅ (Admin)
Get paginated advertisements with filters
POST
/api/admin/advertisements/:id/manage
✅ (Admin)
Manage advertisement (approve, reject, pause, edit, delete)

GFE Management
GET
/api/admin/gfe
✅ (Admin)
Get paginated GFE list with filters
POST
/api/admin/gfe/:id/manage
✅ (Admin)
Manage GFE (lock/unlock wallet, adjust earnings, update settings)

Analytics & Reporting
GET
/api/admin/referral-funnel
✅ (Admin)
Get referral funnel analytics
GET
/api/admin/campaigns
✅ (Admin)
Get campaign management data
POST
/api/admin/campaigns/:id/manage
✅ (Admin)
Manage campaigns (create, activate, edit, delete)
GET
/api/admin/leaderboard
✅ (Admin)
Get leaderboard management data
POST
/api/admin/leaderboard/manage
✅ (Admin)
Manage leaderboard (update visibility, recalculate rankings)

📊 Total Endpoint Count
Public Endpoints: 12
Authenticated Endpoints: 38
Admin-Only Endpoints: 14
Total Endpoints: 64
🔑 Authentication Notes
✅ Auth Required: Requires valid JWT access token (via cookie or Authorization: Bearer <token> header)
✅ (Admin): Requires admin/super_admin role
✅ (GFE): Requires user to have isGFE: true flag
✅ (Firm): Requires user to have userType: 'firm' and verificationStatus: 'approved'
🛡️ Security Features Applied
CAPTCHA: Required on all signup endpoints
OTP Verification: Phone verification for all user types
Email Verification: Required for account activation
Honeypot Fields: Bot protection on signup forms
IP Rate Limiting: 5 requests/hour/IP on auth endpoints
Password Policy: 6+ chars with uppercase, lowercase, number
Role-Based Access: Strict permission controls for admin endpoints
Audit Logging: All admin actions logged with IP and user agent
This comprehensive API covers 100% of the requirements specified in your Investours documentation, including all user types, security layers, GFE functionality, admin controls, and community features.