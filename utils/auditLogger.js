const AuditLog = require('../models/AuditLog');

// Centralized audit logger
exports.logAction = async (action, actorId, actorRole, targetId, targetModel, details = {}, req) => {
  try {
    await AuditLog.create({
      action,
      actor: actorId,
      actorRole,
      target: targetId,
      targetModel,
      details,
      ipAddress: req?.ip || 'unknown',
      userAgent: req?.headers['user-agent'] || 'unknown'
    });
  } catch (error) {
    console.error('⚠️ Failed to log audit action:', error.message);
    // Do not throw – audit failure should not break main flow
  }
};