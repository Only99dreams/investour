// Simple honeypot middleware to block bots
const honeypotMiddleware = (req, res, next) => {
  // Check common honeypot fields
  const honeypotFields = ['website', 'company_website', 'url', 'phone2'];
  
  for (const field of honeypotFields) {
    if (req.body[field] && req.body[field].trim() !== '') {
      console.log(`⚠️ Bot detected via honeypot field: ${field} = ${req.body[field]}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid submission'
      });
    }
  }
  
  next();
};

module.exports = honeypotMiddleware;