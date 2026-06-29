const express = require('express');
const router = express.Router();
const {
  getUserNotifications,
  markNotificationRead,
  clearAllNotifications,
  getUserStats
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/notifications', protect, getUserNotifications);
router.put('/notifications/:id', protect, markNotificationRead);
router.delete('/notifications', protect, clearAllNotifications);
router.get('/stats', protect, getUserStats);

module.exports = router;
