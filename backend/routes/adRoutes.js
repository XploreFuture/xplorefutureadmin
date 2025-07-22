import express from 'express';
import Ad from '../models/Ad.js';

const router = express.Router();

router.post('/track/view/:id', async (req, res) => {
  try {
    const updatedAd = await Ad.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!updatedAd) {
      return res.status(404).json({ message: "Ad not found." });
    }
    res.status(200).json({ message: 'View counted', ad: updatedAd });
  } catch (err) {
    console.error("Error tracking ad view:", err);
    res.status(500).json({ error: "Failed to track view.", details: err.message });
  }
});

router.post('/track/click/:id', async (req, res) => {
  try {
    const updatedAd = await Ad.findByIdAndUpdate(
      req.params.id,
      { $inc: { clicks: 1 } },
      { new: true }
    );

    if (!updatedAd) {
      return res.status(404).json({ message: "Ad not found." });
    }
    res.status(200).json({ message: 'Click counted', ad: updatedAd });
  } catch (err) {
    console.error("Error tracking ad click:", err);
    res.status(500).json({ error: "Failed to track click.", details: err.message });
  }
});

router.post('/add', async (req, res) => {
  try {
    const ad = await Ad.create(req.body);
    res.status(201).json(ad);
  } catch (err) {
    console.error("Error adding ad:", err);
    if (err.name === 'ValidationError') {
        return res.status(400).json({ error: "Validation failed", details: err.message, errors: err.errors });
    }
    res.status(500).json({ error: "Failed to add ad.", details: err.message });
  }
});

router.get('/active', async (req, res) => {
  try {
    const now = new Date();
    const ads = await Ad.find({
      isActive: true,
      $or: [
        { startDate: { $lte: now }, endDate: { $gte: now } },
        { startDate: null, endDate: null },
        { startDate: { $exists: false }, endDate: { $exists: false } }
      ]
    });
    res.json(ads);
  } catch (err) {
    console.error("Error fetching active ads:", err);
    res.status(500).json({ error: "Failed to fetch active ads.", details: err.message });
  }
});

export default router;