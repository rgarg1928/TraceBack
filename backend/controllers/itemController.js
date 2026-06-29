const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Helper function to calculate similarity between words
const calculateMatchScore = (lostItem, foundItem) => {
  let score = 0;

  // 1. Category match (highly weighted)
  if (lostItem.category.toLowerCase().trim() === foundItem.category.toLowerCase().trim()) {
    score += 50;
  }

  // Helper to extract keywords (lowercase, alphanumeric, length > 2, excluding common stop words)
  const getKeywords = (text) => {
    if (!text) return [];
    const stops = new Set(['the', 'and', 'for', 'with', 'from', 'lost', 'found', 'this', 'that', 'near', 'under', 'near', 'blocking']);
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stops.has(w));
  };

  const lostNameWords = getKeywords(lostItem.itemName);
  const foundNameWords = getKeywords(foundItem.itemName);

  const lostDescWords = getKeywords(lostItem.description);
  const foundDescWords = getKeywords(foundItem.description);

  // 2. Name match (check intersection of words)
  const nameIntersection = lostNameWords.filter(word => foundNameWords.includes(word));
  score += nameIntersection.length * 20;

  // 3. Description match
  const descIntersection = lostDescWords.filter(word => foundDescWords.includes(word));
  score += descIntersection.length * 5;

  return score;
};

// Check matches and generate notifications
const findMatchesAndNotify = async (newItem, type) => {
  try {
    const threshold = 60; // minimum score to consider a match
    const notifications = [];

    if (type === 'lost') {
      const foundItems = await FoundItem.find({ status: 'Found' }).populate('user');
      for (const foundItem of foundItems) {
        const score = calculateMatchScore(newItem, foundItem);
        if (score >= threshold) {
          // Create notifications for the user who lost the item
          notifications.push({
            user: newItem.user,
            type: 'Match',
            message: `Smart Match: A found item "${foundItem.itemName}" might match your lost item "${newItem.itemName}". Check it out!`,
            link: `/found-items/${foundItem._id}`
          });

          // Create notification for the user who found the item
          if (foundItem.user && foundItem.user._id.toString() !== newItem.user.toString()) {
            notifications.push({
              user: foundItem.user._id,
              type: 'Match',
              message: `Smart Match: A newly reported lost item "${newItem.itemName}" might match the item "${foundItem.itemName}" you found.`,
              link: `/lost-items/${newItem._id}`
            });
          }
        }
      }
    } else {
      const lostItems = await LostItem.find({ status: 'Lost' }).populate('user');
      for (const lostItem of lostItems) {
        const score = calculateMatchScore(lostItem, newItem);
        if (score >= threshold) {
          // Create notifications for the user who found the item
          notifications.push({
            user: newItem.user,
            type: 'Match',
            message: `Smart Match: A lost item "${lostItem.itemName}" might match the item "${newItem.itemName}" you found.`,
            link: `/lost-items/${lostItem._id}`
          });

          // Create notification for the user who lost the item
          if (lostItem.user && lostItem.user._id.toString() !== newItem.user.toString()) {
            notifications.push({
              user: lostItem.user._id,
              type: 'Match',
              message: `Smart Match: A newly reported found item "${newItem.itemName}" might match your lost item "${lostItem.itemName}". Check it out!`,
              link: `/found-items/${newItem._id}`
            });
          }
        }
      }
    }

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  } catch (error) {
    console.error('Error in smart matching and notification system:', error);
  }
};

/* ==================== LOST ITEMS CRUD ==================== */

// Create Lost Item
exports.createLostItem = async (req, res) => {
  try {
    const { itemName, category, description, lostLocation, lostDate } = req.body;

    const lostItemData = {
      itemName,
      category,
      description,
      lostLocation,
      lostDate,
      user: req.user.id
    };

    if (req.file) {
      lostItemData.image = `/uploads/${req.file.filename}`;
    }

    const lostItem = await LostItem.create(lostItemData);

    // Trigger Smart Matcher in background
    findMatchesAndNotify(lostItem, 'lost');

    res.status(201).json({ success: true, data: lostItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all Lost Items with Search and Filter
exports.getLostItems = async (req, res) => {
  try {
    const { search, category, status } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { itemName: { $regex: search, $options: 'i' } },
        { lostLocation: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const lostItems = await LostItem.find(query).populate('user', 'name email contactNumber role').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: lostItems.length, data: lostItems });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Single Lost Item
exports.getLostItemById = async (req, res) => {
  try {
    const lostItem = await LostItem.findById(req.params.id).populate('user', 'name email contactNumber role');
    if (!lostItem) {
      return res.status(404).json({ success: false, message: 'Lost item not found' });
    }
    res.status(200).json({ success: true, data: lostItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Lost Item
exports.updateLostItem = async (req, res) => {
  try {
    let lostItem = await LostItem.findById(req.params.id);
    if (!lostItem) {
      return res.status(404).json({ success: false, message: 'Lost item not found' });
    }

    // Authorization check: User must own the report OR be a Super Admin/Warden
    if (lostItem.user.toString() !== req.user.id && !['Super Admin', 'Warden'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this item' });
    }

    const fieldsToUpdate = {
      itemName: req.body.itemName,
      category: req.body.category,
      description: req.body.description,
      lostLocation: req.body.lostLocation,
      lostDate: req.body.lostDate,
      status: req.body.status
    };

    if (req.file) {
      fieldsToUpdate.image = `/uploads/${req.file.filename}`;
    }

    lostItem = await LostItem.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: lostItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Lost Item
exports.deleteLostItem = async (req, res) => {
  try {
    const lostItem = await LostItem.findById(req.params.id);
    if (!lostItem) {
      return res.status(404).json({ success: false, message: 'Lost item not found' });
    }

    // Authorization check: User must own the report OR be a Super Admin/Warden/Security Guard
    if (lostItem.user.toString() !== req.user.id && !['Super Admin', 'Warden', 'Security Guard'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this item' });
    }

    await lostItem.deleteOne();
    res.status(200).json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ==================== FOUND ITEMS CRUD ==================== */

// Create Found Item
exports.createFoundItem = async (req, res) => {
  try {
    const { itemName, category, description, foundLocation, foundDate } = req.body;

    const foundItemData = {
      itemName,
      category,
      description,
      foundLocation,
      foundDate,
      user: req.user.id
    };

    if (req.file) {
      foundItemData.image = `/uploads/${req.file.filename}`;
    }

    const foundItem = await FoundItem.create(foundItemData);

    // Trigger Smart Matcher in background
    findMatchesAndNotify(foundItem, 'found');

    res.status(201).json({ success: true, data: foundItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all Found Items with Search and Filter
exports.getFoundItems = async (req, res) => {
  try {
    const { search, category, status } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { itemName: { $regex: search, $options: 'i' } },
        { foundLocation: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const foundItems = await FoundItem.find(query).populate('user', 'name email contactNumber role').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: foundItems.length, data: foundItems });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Single Found Item
exports.getFoundItemById = async (req, res) => {
  try {
    const foundItem = await FoundItem.findById(req.params.id).populate('user', 'name email contactNumber role');
    if (!foundItem) {
      return res.status(404).json({ success: false, message: 'Found item not found' });
    }
    res.status(200).json({ success: true, data: foundItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Found Item
exports.updateFoundItem = async (req, res) => {
  try {
    let foundItem = await FoundItem.findById(req.params.id);
    if (!foundItem) {
      return res.status(404).json({ success: false, message: 'Found item not found' });
    }

    // Authorization check
    if (foundItem.user.toString() !== req.user.id && !['Super Admin', 'Warden'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this item' });
    }

    const fieldsToUpdate = {
      itemName: req.body.itemName,
      category: req.body.category,
      description: req.body.description,
      foundLocation: req.body.foundLocation,
      foundDate: req.body.foundDate,
      status: req.body.status
    };

    if (req.file) {
      fieldsToUpdate.image = `/uploads/${req.file.filename}`;
    }

    foundItem = await FoundItem.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: foundItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Found Item
exports.deleteFoundItem = async (req, res) => {
  try {
    const foundItem = await FoundItem.findById(req.params.id);
    if (!foundItem) {
      return res.status(404).json({ success: false, message: 'Found item not found' });
    }

    // Authorization check
    if (foundItem.user.toString() !== req.user.id && !['Super Admin', 'Warden', 'Security Guard'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this item' });
    }

    await foundItem.deleteOne();
    res.status(200).json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ==================== SMART MATCHES API ==================== */

// Get Smart Matches for a specific item
exports.getSmartMatches = async (req, res) => {
  try {
    const { itemId, type } = req.params;
    const threshold = 60;
    let matches = [];

    if (type === 'lost') {
      const lostItem = await LostItem.findById(itemId);
      if (!lostItem) {
        return res.status(404).json({ success: false, message: 'Lost item not found' });
      }
      const foundItems = await FoundItem.find({ status: 'Found' }).populate('user', 'name email contactNumber');
      for (const foundItem of foundItems) {
        const score = calculateMatchScore(lostItem, foundItem);
        if (score >= threshold) {
          matches.push({ item: foundItem, score });
        }
      }
    } else {
      const foundItem = await FoundItem.findById(itemId);
      if (!foundItem) {
        return res.status(404).json({ success: false, message: 'Found item not found' });
      }
      const lostItems = await LostItem.find({ status: 'Lost' }).populate('user', 'name email contactNumber');
      for (const lostItem of lostItems) {
        const score = calculateMatchScore(lostItem, foundItem);
        if (score >= threshold) {
          matches.push({ item: lostItem, score });
        }
      }
    }

    // Sort by match score descending
    matches.sort((a, b) => b.score - a.score);

    res.status(200).json({ success: true, data: matches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
