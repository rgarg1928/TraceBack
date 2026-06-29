const User = require('../models/User');
const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');
const Claim = require('../models/Claim');

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/stats
// @access  Private (Super Admin, Warden, Security Guard)
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalLost = await LostItem.countDocuments();
    const totalFound = await FoundItem.countDocuments();
    const totalClaims = await Claim.countDocuments();

    // Extra breakdown for UI dashboards
    const pendingClaims = await Claim.countDocuments({ status: 'Pending' });
    const approvedClaims = await Claim.countDocuments({ status: 'Approved' });
    const rejectedClaims = await Claim.countDocuments({ status: 'Rejected' });

    const activeLost = await LostItem.countDocuments({ status: 'Lost' });
    const matchedLost = await LostItem.countDocuments({ status: 'Matched' });
    const returnedLost = await LostItem.countDocuments({ status: 'Returned' });

    const activeFound = await FoundItem.countDocuments({ status: 'Found' });
    const claimedFound = await FoundItem.countDocuments({ status: 'Claimed' });
    const returnedFound = await FoundItem.countDocuments({ status: 'Returned' });

    res.status(200).json({
      success: true,
      stats: {
        users: totalUsers,
        lost: totalLost,
        found: totalFound,
        claims: totalClaims,
        claimsBreakdown: {
          pending: pendingClaims,
          approved: approvedClaims,
          rejected: rejectedClaims
        },
        lostBreakdown: {
          lost: activeLost,
          matched: matchedLost,
          returned: returnedLost
        },
        foundBreakdown: {
          found: activeFound,
          claimed: claimedFound,
          returned: returnedFound
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users for management
// @route   GET /api/admin/users
// @access  Private (Super Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Super Admin only)
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['Student', 'Teacher', 'Security Guard', 'Warden', 'Super Admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Protection: Can't demote yourself
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot change your own role' });
    }

    user.role = role;
    await user.save();

    res.status(200).json({ success: true, message: `User role updated to ${role} successfully`, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Super Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Protection: Can't delete yourself
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete yourself' });
    }

    // Remove user reports and claims if needed, or simply delete the user
    // For TraceBack, let's delete the user document
    await user.deleteOne();

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
