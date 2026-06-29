const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Get chat history between current user and target user
// @route   GET /api/chat/history/:userId
// @access  Private
exports.getChatHistory = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const targetUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: targetUserId },
        { sender: targetUserId, receiver: currentUserId }
      ]
    })
    .sort({ createdAt: 1 });

    // Mark messages from target to current as read
    await Message.updateMany(
      { sender: targetUserId, receiver: currentUserId, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users whom the current user has chatted with, or general user list
// @route   GET /api/chat/users
// @access  Private
exports.getChatUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Find all message senders and receivers that involve the current user
    const messages = await Message.find({
      $or: [{ sender: currentUserId }, { receiver: currentUserId }]
    }).sort({ createdAt: -1 });

    const userIds = new Set();
    messages.forEach((msg) => {
      if (msg.sender.toString() !== currentUserId) {
        userIds.add(msg.sender.toString());
      }
      if (msg.receiver.toString() !== currentUserId) {
        userIds.add(msg.receiver.toString());
      }
    });

    // Retrieve full info of these users
    const activeChatUsers = await User.find({ _id: { $in: Array.from(userIds) } });

    // Also get all other users in system so they can start new chat
    const allUsers = await User.find({ _id: { $ne: currentUserId } }).select('name email role contactNumber profilePic');

    res.status(200).json({
      success: true,
      activeUsers: activeChatUsers,
      allUsers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
