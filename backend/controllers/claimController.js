const Claim = require('../models/Claim');
const FoundItem = require('../models/FoundItem');
const Notification = require('../models/Notification');

// @desc    Create a Claim Request
// @route   POST /api/claims
// @access  Private (Students, Teachers, etc.)
exports.createClaim = async (req, res) => {
  try {
    const { foundItemId, verificationMessage } = req.body;

    if (!foundItemId || !verificationMessage) {
      return res.status(400).json({ success: false, message: 'Please provide foundItemId and verificationMessage' });
    }

    const foundItem = await FoundItem.findById(foundItemId);
    if (!foundItem) {
      return res.status(404).json({ success: false, message: 'Found item not found' });
    }

    if (foundItem.status !== 'Found') {
      return res.status(400).json({ success: false, message: 'This item is already claimed or returned' });
    }

    // Check if user already claimed this item
    const existingClaim = await Claim.findOne({ foundItem: foundItemId, claimer: req.user.id });
    if (existingClaim) {
      return res.status(400).json({ success: false, message: 'You have already submitted a claim for this item' });
    }

    const claim = await Claim.create({
      foundItem: foundItemId,
      claimer: req.user.id,
      verificationMessage
    });

    // Notify the person who found the item
    await Notification.create({
      user: foundItem.user,
      type: 'General',
      message: `New Claim Request: Someone submitted a claim request for the "${foundItem.itemName}" you found.`,
      link: `/claims`
    });

    res.status(201).json({ success: true, data: claim });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Claims made by logged-in user
// @route   GET /api/claims/myclaims
// @access  Private
exports.getMyClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ claimer: req.user.id })
      .populate({
        path: 'foundItem',
        populate: { path: 'user', select: 'name email' }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: claims.length, data: claims });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get incoming claims for items found by logged-in user
// @route   GET /api/claims/incoming
// @access  Private
exports.getIncomingClaims = async (req, res) => {
  try {
    // Find items found by the user
    const foundItems = await FoundItem.find({ user: req.user.id });
    const itemIds = foundItems.map(item => item._id);

    const claims = await Claim.find({ foundItem: { $in: itemIds } })
      .populate('foundItem')
      .populate('claimer', 'name email contactNumber role')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: claims.length, data: claims });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all Claims (Admin, Warden, Security Guard)
// @route   GET /api/claims
// @access  Private
exports.getAllClaims = async (req, res) => {
  try {
    const claims = await Claim.find()
      .populate('foundItem')
      .populate('claimer', 'name email contactNumber role')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: claims.length, data: claims });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve or Reject a Claim Request
// @route   PUT /api/claims/:id
// @access  Private (Found Item Finder, Admin, Warden, Security Guard)
exports.updateClaimStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'Approved' or 'Rejected'
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const claim = await Claim.findById(req.params.id).populate('foundItem');
    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim request not found' });
    }

    const foundItem = await FoundItem.findById(claim.foundItem._id);
    if (!foundItem) {
      return res.status(404).json({ success: false, message: 'Associated found item not found' });
    }

    // Authorization check: Only founder or Admin roles
    const isFounder = foundItem.user.toString() === req.user.id;
    const isAdmin = ['Super Admin', 'Warden', 'Security Guard'].includes(req.user.role);

    if (!isFounder && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to approve/reject claims for this item' });
    }

    claim.status = status;
    await claim.save();

    if (status === 'Approved') {
      // Mark found item status as claimed
      foundItem.status = 'Claimed';
      await foundItem.save();

      // Create notification for claimer
      await Notification.create({
        user: claim.claimer,
        type: 'ClaimApproved',
        message: `Claim Approved: Your claim for "${foundItem.itemName}" has been approved! Contact the finder/admin to collect it.`,
        link: `/claims`
      });

      // Reject all other claims for this found item
      const otherClaims = await Claim.find({ foundItem: foundItem._id, _id: { $ne: claim._id }, status: 'Pending' });
      for (const otherClaim of otherClaims) {
        otherClaim.status = 'Rejected';
        await otherClaim.save();

        await Notification.create({
          user: otherClaim.claimer,
          type: 'ClaimRejected',
          message: `Claim Rejected: The item "${foundItem.itemName}" you claimed has been claimed by another owner.`,
          link: `/claims`
        });
      }
    } else {
      // Rejection flow
      await Notification.create({
        user: claim.claimer,
        type: 'ClaimRejected',
        message: `Claim Rejected: Your claim request for "${foundItem.itemName}" has been rejected. Insufficient proof.`,
        link: `/claims`
      });
    }

    res.status(200).json({ success: true, data: claim });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
