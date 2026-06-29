const Notification = require('../models/Notification');
const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');
const Claim = require('../models/Claim');

// @desc    Get user notifications
// @route   GET /api/users/notifications
// @access  Private
exports.getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: notifications.length, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/users/notifications/:id
// @access  Private
exports.markNotificationRead = async (req, res) => {
  try {
    let notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (notification.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to read this notification' });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Clear all notifications for user
// @route   DELETE /api/users/notifications
// @access  Private
exports.clearAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user.id });
    res.status(200).json({ success: true, message: 'All notifications cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get dashboard statistics for a specific user
// @route   GET /api/users/stats
// @access  Private
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Total lost items reported by this user
    const totalLost = await LostItem.countDocuments({ user: userId });

    // Total found items reported by this user
    const totalFound = await FoundItem.countDocuments({ user: userId });

    // Active claims submitted by this user (Status: Pending)
    const activeClaims = await Claim.countDocuments({ claimer: userId, status: 'Pending' });

    // Returned items (Lost items with status 'Returned' + claims submitted by this user that are 'Approved')
    const returnedLostItems = await LostItem.countDocuments({ user: userId, status: 'Returned' });
    const approvedClaims = await Claim.countDocuments({ claimer: userId, status: 'Approved' });
    const returnedItems = returnedLostItems + approvedClaims;

    res.status(200).json({
      success: true,
      stats: {
        totalLost,
        totalFound,
        activeClaims,
        returnedItems
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
