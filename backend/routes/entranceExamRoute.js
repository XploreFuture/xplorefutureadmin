import express from 'express';
import EntranceExamDetail from '../models/EntranceExamDetail.js';

const router = express.Router();

router.get("/:slug", async (req, res) => {
  try {
    const detail = await EntranceExamDetail.findOne({ slug: req.params.slug });

    if (!detail) {
      return res.status(404).json({ message: "Exam detail not found." });
    }

    res.json(detail);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch exam detail.", details: err.message });
  }
});

router.post("/", async (req, res) => {
  const { slug, overview, eligibility, syllabus, pattern, conductingBody, website } = req.body;

  if (!slug) {
      return res.status(400).json({ message: "Slug is required to add or update exam details." });
  }

  try {
    const updated = await EntranceExamDetail.findOneAndUpdate(
      { slug },
      { overview, eligibility, syllabus, pattern, conductingBody, website },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(updated);
  } catch (err) {
    if (err.name === 'ValidationError') {
        return res.status(400).json({ error: "Validation failed", details: err.message, errors: err.errors });
    }
    res.status(500).json({ message: "Failed to save or update entrance exam detail.", details: err.message });
  }
});

export default router;