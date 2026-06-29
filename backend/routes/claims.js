const express = require('express');
const router = express.Router();
const {
  createClaim,
  getMyClaims,
  getIncomingClaims,
  getAllClaims,
  updateClaimStatus
} = require('../controllers/claimController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .post(protect, createClaim)
  .get(protect, authorize('Super Admin', 'Warden', 'Security Guard'), getAllClaims);

router.get('/myclaims', protect, getMyClaims);
router.get('/incoming', protect, getIncomingClaims);

router.route('/:id')
  .put(protect, updateClaimStatus);

module.exports = router;
