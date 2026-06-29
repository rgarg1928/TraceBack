const express = require('express');
const router = express.Router();
const {
  createLostItem,
  getLostItems,
  getLostItemById,
  updateLostItem,
  deleteLostItem,
  createFoundItem,
  getFoundItems,
  getFoundItemById,
  updateFoundItem,
  deleteFoundItem,
  getSmartMatches
} = require('../controllers/itemController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Lost Items CRUD routes
router.route('/lost')
  .post(protect, upload.single('image'), createLostItem)
  .get(getLostItems);

router.route('/lost/:id')
  .get(getLostItemById)
  .put(protect, upload.single('image'), updateLostItem)
  .delete(protect, deleteLostItem);

// Found Items CRUD routes
router.route('/found')
  .post(protect, upload.single('image'), createFoundItem)
  .get(getFoundItems);

router.route('/found/:id')
  .get(getFoundItemById)
  .put(protect, upload.single('image'), updateFoundItem)
  .delete(protect, deleteFoundItem);

// Smart matching route
router.get('/smart-matches/:type/:itemId', protect, getSmartMatches);

module.exports = router;
