import express from 'express';
import Institution from '../models/Institution.js';
import protect from '../middlewares/authMiddleware.js';
import authorizeRoles from '../middlewares/authorizeRoles.js';

const router = express.Router();

router.post("/", protect, authorizeRoles(['admin']), async (req, res) => {
  try {
    const authorId = req.user._id;

    if (!authorId) {
      return res.status(401).json({ error: "Authenticated user ID not found after middleware." });
    }

    const newInstitution = new Institution({
      ...req.body,
      author: authorId
    });
    const saved = await newInstitution.save();
    res.status(201).json(saved);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: "Validation failed", details: err.message, errors: err.errors });
    }
    res.status(500).json({ error: "Failed to create institution", details: err.message });
  }
});

router.get('/:type/:name', async (req, res) => {
  try {
    const { type, name } = req.params;
    const decodedName = decodeURIComponent(name);
    const institution = await Institution.findOne({ type: type, name: decodedName });

    if (!institution) {
      return res.status(404).json({ msg: 'Institution not found.' });
    }

    res.status(200).json(institution);
  } catch (error) {
    res.status(500).json({ msg: 'Server error while fetching institution.' });
  }
});

router.put('/:id', protect, authorizeRoles(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const updatedInstitution = await Institution.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!updatedInstitution) {
      return res.status(404).json({ msg: 'Institution not found for update.' });
    }

    res.status(200).json({ msg: 'Institution updated successfully', institution: updatedInstitution });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.keys(error.errors).map(key => error.errors[key].message);
      return res.status(400).json({ msg: 'Validation error', errors: errors });
    }
    res.status(500).json({ msg: 'Server error while updating institution.' });
  }
});

router.get("/", async (req, res) => {
  try {
    const { category, course, owner, state, city, entranceExam, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (category && category.trim() !== "") {
      filter.category = { $regex: category, $options: "i" };
    }
    if (course && course.trim() !== "") {
      filter["coursesAndFees.course"] = { $regex: course, $options: "i" };
    }
    if (state && state.trim() !== "") {
      const decodedState = decodeURIComponent(state);
      filter["location.state"] = { $regex: decodedState, $options: "i" };
    }
    if (city && city.trim() !== "") {
      filter["location.city"] = { $regex: city, $options: "i" };
    }
    if (entranceExam && entranceExam.trim() !== "") {
      filter["coursesAndFees.entranceExam"] = { $regex: entranceExam, $options: "i" };
    }
    if (owner) {
      filter.owner = { $regex: owner, $options: "i" };
    }

    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;

    const institutions = await Institution.find(filter)
      .sort({ name: 1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    const total = await Institution.countDocuments(filter);

    res.json({
      total,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      institutions,
      totalResults: total
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch institutions", details: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updated = await Institution.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) {
      return res.status(404).json({ error: "Institution not found" });
    }
    res.json(updated);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: "Validation failed", details: err.message, errors: err.errors });
    }
    res.status(500).json({ error: "Failed to update institution", details: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Institution.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Institution not found" });
    }
    res.json({ message: "Institution deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete institution", details: err.message });
  }
});

router.post("/add-ranking/:name", async (req, res) => {
  const { name } = req.params;
  const { agency, rank, year } = req.body;

  if (!agency || !rank || !year) {
    return res.status(400).json({ message: "agency, rank, and year are required for ranking." });
  }

  try {
    const institution = await Institution.findOne({ name: new RegExp(`^${decodeURIComponent(name)}$`, "i") });

    if (!institution) {
      return res.status(404).json({ message: "Institution not found" });
    }

    if (!Array.isArray(institution.rankings)) {
      institution.rankings = [];
    }

    const existingRanking = institution.rankings.find(r => r.agency === agency && r.year === year);

    if (existingRanking) {
      existingRanking.rank = rank;
    } else {
      institution.rankings.push({ agency, rank, year });
    }

    await institution.save();
    res.json({ message: "Ranking updated successfully", rankings: institution.rankings });
  } catch (err) {
    res.status(500).json({ message: "Server error", details: err.message });
  }
});

router.get('/all', protect, authorizeRoles(['admin']), async (req, res) => {
  try {
    const institutions = await Institution.find({})
      .select('name type category location.city location.state')
      .sort('name');

    res.status(200).json(institutions);
  } catch (error) {
    res.status(500).json({ msg: 'Server error while fetching all institutions.' });
  }
});

export default router;