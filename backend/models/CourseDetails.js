import mongoose from 'mongoose';

const courseDetailSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  specification: {
    type: String,
    trim: true
  },
  careerOptions: {
    type: [String],
    default: []
  },
  eligibility: {
    type: String,
    trim: true
  },
  avgFees: {
    type: String,
    trim: true
  },
}, {
  timestamps: true
});

const CourseDetail = mongoose.model("CourseDetail", courseDetailSchema);

export default CourseDetail;