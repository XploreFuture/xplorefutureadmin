import express from 'express';
import PageView from '../models/PageView.js';

const router = express.Router();

router.post("/", async (req, res) => {
  const { path } = req.body;

  if (!path) {
    return res.status(400).json({ error: "Path is required to increment views." });
  }

  try {
    const pageView = await PageView.findOneAndUpdate(
      { path },
      { $inc: { views: 1 } },
      { upsert: true, new: true }
    );
    res.json(pageView);
  } catch (err) {
    res.status(500).json({ error: "Failed to update page views." });
  }
});

router.get("/:path", async (req, res) => {
  try {
    const fullPath = `/${req.params.path}`;
    const pageView = await PageView.findOne({ path: fullPath });

    res.json({ views: pageView ? pageView.views : 0 });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch page views for the specified path." });
  }
});

router.get("/", async (req, res) => {
  try {
    const allViews = await PageView.find();
    res.json(allViews);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch all page views." });
  }
});

export default router;