// controllers/groupController.js
const Group = require('../models/Group');

exports.getGroupDashboard = async (req, res) => {
  try {
    const group = await Group.findById(req.user.id);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    res.status(200).json({
      success: true,
      group: {
        id: group._id,
        groupName: group.groupName,
        groupType: group.groupType,
        contactPerson: group.contactPerson,
        country: group.country,
        region: group.region,
        tier: group.tier,
        isGFE: group.isGFE,
        isVerified: group.isVerified
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load group dashboard', error: error.message });
  }
};