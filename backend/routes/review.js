import express from 'express';
import mongoose from 'mongoose';
import Review from '../models/Review.js';
import protect from '../middlewares/authMiddleware.js';
import authorizeRoles from '../middlewares/authorizeRoles.js';

import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

router.post("/add", protect, async (req, res) => {
  const { contentTitle, userName, userEmail, course, internship, ratings, comments } = req.body;
  const userId = req.user?.id;

  if (!contentTitle || !userName || !userEmail || !ratings || !comments) {
    return res.status(400).json({ message: "Content title, user name, user email, ratings, and comments are required." });
  }

  if (!userId) {
    return res.status(401).json({ message: "Authentication error: User ID not available to save review." });
  }

  try {
    const existingReview = await Review.findOne({ contentTitle, user: userId });
    if (existingReview) {
      return res.status(409).json({ message: "You have already submitted a review for this institution." });
    }

    const review = new Review({
      contentTitle,
      userName,
      userEmail,
      course,
      internship,
      ratings,
      comments,
      user: userId,
    });

    await review.save();
    res.status(201).json({ message: "Review submitted successfully." });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const errors = Object.keys(err.errors).map(key => err.errors[key].message);
      return res.status(400).json({ message: "Validation error saving review", details: errors });
    }
    if (err.code === 11000) {
      return res.status(409).json({ message: "You have already submitted a review for this institution." });
    }
    res.status(500).json({ message: "Error submitting review", details: err instanceof Error ? err.message : 'An unknown error occurred' });
  }
});

router.get("/check-user-review/:contentTitle", protect, async (req, res) => {
  try {
    const contentTitle = decodeURIComponent(req.params.contentTitle);
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required or user ID not found." });
    }

    const existingReview = await Review.findOne({
      contentTitle: contentTitle,
      user: userId
    });

    if (existingReview) {
      res.status(200).json({ hasReviewed: true, review: existingReview });
    } else {
      res.status(200).json({ hasReviewed: false });
    }
  } catch (err) {
    res.status(500).json({ message: "Error checking user review (review route)", details: err instanceof Error ? err.message : 'An unknown error occurred' });
  }
});

router.get('/reported', protect, authorizeRoles(['admin']), async (req, res) => {
  try {
    const query = {
      reports: { $type: 4, $ne: [] }
    };

    const reportedReviews = await Review.find(query)
      .populate('reports.user', 'fullName email')
      .sort({ 'reports.date': -1 });

    res.status(200).json({
      reviews: reportedReviews,
      totalPages: 1,
      currentPage: 1,
      totalReviews: reportedReviews.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching reported reviews.', details: error instanceof Error ? error.message : 'An unknown error occurred' });
  }
});

router.get("/:contentTitle", async (req, res) => {
  try {
    const { page = 1, limit = 5 } = req.query;
    const contentTitle = decodeURIComponent(req.params.contentTitle);

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (isNaN(pageNum) || pageNum < 1 || isNaN(limitNum) || limitNum < 1) {
      return res.status(400).json({ message: "Invalid page or limit parameters." });
    }

    const query = { contentTitle, isHidden: false };

    const reviews = await Review.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const total = await Review.countDocuments(query);

    res.json({
      reviews,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      totalReviews: total
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching reviews", details: err instanceof Error ? err.message : 'An unknown error occurred' });
  }
});

router.get("/average/:institutionName", async (req, res) => {
  try {
    const institutionName = decodeURIComponent(req.params.institutionName);

    const result = await Review.aggregate([
      { $match: { contentTitle: institutionName, "ratings.overall": { $exists: true }, isHidden: false } },
      {
        $group: {
          _id: null,
          avgInfrastructure: { $avg: "$ratings.infrastructure" },
          avgCourseCurriculum: { $avg: "$ratings.courseCurriculum" },
          avgFaculty: { $avg: "$ratings.faculty" },
          avgPlacement: { $avg: "$ratings.placement" },
          avgOverall: { $avg: "$ratings.overall" }
        },
      },
      {
        $project: {
          _id: 0,
          avgInfrastructure: { $ifNull: ["$avgInfrastructure", 0] },
          avgCourseCurriculum: { $ifNull: ["$avgCourseCurriculum", 0] },
          avgFaculty: { $ifNull: ["$avgFaculty", 0] },
          avgPlacement: { $ifNull: ["$avgPlacement", 0] },
          avgOverall: { $ifNull: ["$avgOverall", 0] }
        }
      }
    ]);

    res.json(result[0] || {
      avgInfrastructure: 0,
      avgCourseCurriculum: 0,
      avgFaculty: 0,
      avgPlacement: 0,
      avgOverall: 0
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to calculate average ratings", details: err instanceof Error ? err.message : 'An unknown error occurred' });
  }
});

router.post("/:id/report", protect, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { reason } = req.body;

  if (!userId || !reason) {
    return res.status(400).json({ message: "User ID and reason are required for reporting." });
  }

  try {
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    const alreadyReported = review.reports.some(report => report.user && report.user.toString() === userId);
    if (alreadyReported) {
      return res.status(409).json({ message: "You have already reported this review." });
    }

    review.reports.push({ user: userId, reason, date: new Date() });
    await review.save();

    res.json({ message: "Review reported successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", details: err instanceof Error ? err.message : 'An unknown error occurred' });
  }
});

router.put('/:id/hide', protect, authorizeRoles(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const updatedReview = await Review.findByIdAndUpdate(
      id,
      { isHidden: true },
      { new: true }
    );

    if (!updatedReview) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    res.status(200).json({ message: 'Review hidden successfully', review: updatedReview });
  } catch (error) {
    res.status(500).json({ message: 'Server error while hiding review.', details: error instanceof Error ? error.message : 'An unknown error occurred' });
  }
});

export default router;