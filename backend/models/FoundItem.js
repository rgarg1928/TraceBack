const mongoose = require('mongoose');

const FoundItemSchema = new mongoose.Schema({
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
  foundLocation: {
    type: String,
    required: [true, 'Please add the found location'],
    trim: true
  },
  foundDate: {
    type: Date,
    required: [true, 'Please add the date when the item was found']
  },
  image: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Found', 'Claimed', 'Returned'],
    default: 'Found'
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

module.exports = mongoose.model('FoundItem', FoundItemSchema);
