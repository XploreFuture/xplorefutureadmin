import mongoose from 'mongoose';

const entranceExamDetailSchema = new mongoose.Schema({
  slug: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true
  },
  overview: {
    type: String,
    trim: true
  },
  eligibility: {
    type: String,
    trim: true
  },
  syllabus: {
    type: String,
    trim: true
  },
  pattern: {
    type: String,
    trim: true
  },
  conductingBody: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true
});

const EntranceExamDetail = mongoose.model("EntranceExamDetail", entranceExamDetailSchema);

export default EntranceExamDetail;