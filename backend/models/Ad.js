import mongoose from 'mongoose';

const adSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
    trim: true,
  },
  linkUrl: {
    type: String,
    required: true,
    trim: true,
  },
  position: {
    type: String,
    enum: ['header', 'footer', 'content', 'sidebar', 'popup'],
    default: 'content'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date,
    default: null
  },
  endDate: {
    type: Date,
    default: null
  },
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  clicks: {
    type: Number,
    default: 0,
    min: 0
  },
});

adSchema.set('timestamps', true);

const Ad = mongoose.model('Ad', adSchema);

export default Ad;