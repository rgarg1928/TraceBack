const express = require('express');
const router = express.Router();
const { getChatHistory, getChatUsers } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.get('/history/:userId', protect, getChatHistory);
router.get('/users', protect, getChatUsers);

module.exports = router;
