import express from 'express';
import CourseDetail from '../models/CourseDetails.js';

const router = express.Router();

const validateCourseInput = (req, res, next) => {
  const { slug, specification, careerOptions, eligibility, avgFees } = req.body;

  if (!slug || typeof slug !== 'string' || slug.trim() === '') {
    return res.status(400).json({ message: "Slug is required and must be a non-empty string." });
  }

  if (specification && !Array.isArray(specification)) {
    return res.status(400).json({ message: "Specification must be an array." });
  }
  if (careerOptions && !Array.isArray(careerOptions)) {
    return res.status(400).json({ message: "Career options must be an array." });
  }
  if (eligibility && typeof eligibility !== 'string') {
    return res.status(400).json({ message: "Eligibility must be a string." });
  }
  if (avgFees && (typeof avgFees !== 'number' || avgFees < 0)) {
    return res.status(400).json({ message: "Average fees must be a non-negative number." });
  }

  next();
};

router.get("/:slug", async (req, res) => {
  try {
    const course = await CourseDetail.findOne({ slug: req.params.slug }).lean();

    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    res.json(course);
  } catch (err) {
    res.status(500).json({ message: "An unexpected error occurred while fetching course detail." });
  }
});

router.post("/add", validateCourseInput, async (req, res) => {
  const { slug, specification, careerOptions, eligibility, avgFees } = req.body;

  try {
    const updated = await CourseDetail.findOneAndUpdate(
      { slug },
      { specification, careerOptions, eligibility, avgFees },
      { new: true, upsert: true, runValidators: true }
    );
    res.status(200).json({ message: "Course detail saved successfully", course: updated });
  } catch (err) {
    if (err.name === 'ValidationError') {
        return res.status(400).json({
          message: "Validation failed for course details.",
          details: err.message,
          errors: err.errors
        });
    }
    res.status(500).json({ message: "An unexpected error occurred while saving or updating course detail." });
  }
});

export default router;