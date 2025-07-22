import mongoose from 'mongoose';

const rankingSchema = new mongoose.Schema({
  agency: { type: String, required: false, default: "" },
  rank: { type: Number, required: false, default: 0 },
  year: { type: Number, required: false, default: 0 },
});

const institutionSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  owner: { type: String, enum: ['Government', 'Private', 'Public'], required: true },
  type: { type: String, enum: ['college', 'university'], required: true },
  location: {
    place: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
  },
  establishedYear: {
    type: Number,
    required: true,
    min: 1700,
    max: new Date().getFullYear() + 5,
    validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer year.'
    }
  },
  category: { type: String, trim: true },
  campusArea: { type: String, required: false, trim: true },
  numDepartments: { type: Number, required: false, min: 0 },
  affiliatedTo: { type: String, required: false, trim: true },
  approvedBy: { type: String, required: false, trim: true },
  famousCourse: { type: String, required: false, trim: true },
  averageFee: { type: String, required: false, trim: true },
  coursesAndFees: [
    {
      course: { type: String, required: true, trim: true },
      fees: { type: String, required: true, trim: true },
      duration: { type: String, required: true, trim: true },
      entranceExam: [{ type: String, trim: true }],
    },
  ],
  courseSpecifications: [{
    course: { type: String, trim: true },
    details: { type: String, trim: true }
  }],
  placementDetails: {
    highest: { type: String, default: "Data Not Available", trim: true },
    median: { type: String, default: "Data Not Available", trim: true },
    lowest: { type: String, default: "Data Not Available", trim: true },
  },
  companiesVisited: [{ type: String, trim: true }],
  announcements: [{ type: String, trim: true }],
  additionalInfo: { type: String, trim: true },
  events: {
    type: [
      {
        title: { type: String, required: true, trim: true },
        date: { type: Date, required: true },
        description: { type: String, required: false, trim: true }
      }
    ],
    default: [],
  },

  scholarship: {
    type: String,
    default: "",
    trim: true
  },

  gallery: {
    type: [
      {
        imageUrl: { type: String, required: true, trim: true },
        caption: { type: String, default: "", trim: true }
      }
    ],
    default: []
  },
  facilities: {
    infrastructure: { type: String, enum: ["Available", "Not Available"], default: "Available" },
    laboratories: { type: String, enum: ["Available", "Not Available"], default: "Available" },
    sportsFacilities: { type: String, enum: ["Available", "Not Available"], default: "Available" },
    hostel: { type: String, enum: ["Available", "Not Available"], default: "Available" },
    smartClassroom: { type: String, enum: ["Available", "Not Available"], default: "Available" },
  },
  rankings: [rankingSchema],
   author: {
    type: mongoose.Schema.Types.ObjectId,
     ref: 'User',
     required: true
  }
}, {
  timestamps: true
});
const Institution = mongoose.model("Institution", institutionSchema);

export default Institution;