const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  deleteUser
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.get('/stats', protect, authorize('Super Admin', 'Warden', 'Security Guard'), getDashboardStats);
router.get('/users', protect, authorize('Super Admin'), getAllUsers);
router.put('/users/:id/role', protect, authorize('Super Admin'), updateUserRole);
router.delete('/users/:id', protect, authorize('Super Admin'), deleteUser);

module.exports = router;
