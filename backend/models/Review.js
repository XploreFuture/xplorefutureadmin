import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  contentTitle: {
    type: String,
    required: true,
    trim: true
  },
  userName: {
    type: String,
    required: true,
    trim: true
  },
  userEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  course: {
    type: String,
    trim: true
  },
  internship: {
    type: String,
    trim: true
  },
  ratings: {
    overall: { type: Number, min: 1, max: 5, required: true },
    infrastructure: { type: Number, min: 1, max: 5 },
    courseCurriculum: { type: Number, min: 1, max: 5 },
    faculty: { type: Number, min: 1, max: 5 },
    placement: { type: Number, min: 1, max: 5 },
    facilities: {
      girlSafety: { type: Number, min: 1, max: 5 },
      scholarship: { type: Number, min: 1, max: 5 },
      noRagging: { type: Number, min: 1, max: 5 },
      canteen: { type: Number, min: 1, max: 5 },
      library: { type: Number, min: 1, max: 5 },
    },
  },
  comments: {
    infrastructure: { type: String, trim: true },
    courseCurriculum: { type: String, trim: true },
    faculty: { type: String, trim: true },
    placement: { type: String, trim: true },
    facilities: {
      girlSafety: { type: String, trim: true },
      scholarship: { type: String, trim: true },
      noRagging: { type: String, trim: true },
      canteen: { type: String, trim: true },
      library: { type: String, trim: true },
    },
    overall: { type: String, trim: true }
  },

  reports: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      reason: { type: String, trim: true },
      date: { type: Date, default: Date.now },
    },
  ],
}, {
  timestamps: true
});

reviewSchema.index({ userName: 1, contentTitle: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);

export default Review;