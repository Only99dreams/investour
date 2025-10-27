const crypto = require('crypto');

// Generate secure random token
exports.generateSecureToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Hash sensitive data
exports.hashData = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

// Mask phone number for logs
exports.maskPhone = (phone) => {
  if (!phone) return 'N/A';
  const visibleDigits = 3;
  const masked = phone.slice(0, -visibleDigits).replace(/\d/g, '*') + phone.slice(-visibleDigits);
  return masked;
};

// Mask email for logs
exports.maskEmail = (email) => {
  if (!email) return 'N/A';
  const [local, domain] = email.split('@');
  if (!local || !domain) return 'invalid@email.com';
  const visibleChars = 2;
  const maskedLocal = local.length <= visibleChars 
    ? local 
    : local.substring(0, visibleChars) + '*'.repeat(local.length - visibleChars);
  return `${maskedLocal}@${domain}`;
};