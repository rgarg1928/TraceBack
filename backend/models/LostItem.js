const mongoose = require('mongoose');

const LostItemSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: [true, 'Please add an item name'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  lostLocation: {
    type: String,
    required: [true, 'Please add the lost location'],
    trim: true
  },
  lostDate: {
    type: Date,
    required: [true, 'Please add the date when the item was lost']
  },
  image: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Lost', 'Matched', 'Returned'],
    default: 'Lost'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('LostItem', LostItemSchema);
