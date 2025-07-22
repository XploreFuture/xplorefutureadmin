import express from 'express';
import protect from '../middlewares/authMiddleware.js';
import User from '../models/User.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user).select('-password -refreshToken');
        if (!user) {
            return res.status(404).json({ msg: 'User profile not found' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

router.put('/', protect, async (req, res) => {
    const { gender, dob, collegeName, avatar, social, about } = req.body;

    const profileFields = {};
    if (gender) profileFields.gender = gender;
    if (dob) profileFields.dob = dob;
    if (collegeName) profileFields.collegeName = collegeName;
    if (avatar) profileFields.avatar = avatar;
    if (about) profileFields.about = about; // Added 'about' field here


    if (social) {
        profileFields.social = {};
        if (social.instagram !== undefined) profileFields.social.instagram = social.instagram;
        if (social.website !== undefined) profileFields.social.website = social.website;
        if (social.youtube !== undefined) profileFields.social.youtube = social.youtube;
    }

    try {
        let user = await User.findById(req.user);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        user = await User.findByIdAndUpdate(
            req.user,
            { $set: profileFields },
            { new: true, runValidators: true }
        ).select('-password -refreshToken');

        res.json(user);

    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ errors: err.errors });
        }
        res.status(500).send('Server Error');
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Select public fields INCLUDING 'role' and 'about'
        const user = await User.findById(id).select('fullName email gender dob collegeName avatar social createdAt role about');

        if (!user) {
            return res.status(404).json({ msg: 'User not found.' });
        }

        res.status(200).json(user);
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ msg: 'Invalid user ID format.' });
        }
        res.status(500).json({ msg: 'Server error while fetching user profile.' });
    }
});

export default router;