import mongoose from 'mongoose';

const pageViewSchema = new mongoose.Schema({
  path: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  views: {
    type: Number,
    default: 0,
    min: 0
  },
}, {
  timestamps: true});

const PageView = mongoose.model("PageView", pageViewSchema);

export default PageView;