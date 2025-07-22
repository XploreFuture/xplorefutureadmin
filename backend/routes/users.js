import express from 'express';
import User from '../models/User.js';
import protect from '../middlewares/authMiddleware.js';
import authorizeRoles from '../middlewares/authorizeRoles.js';

const router = express.Router();

router.get('/users', protect, authorizeRoles(['admin']), async (req, res) => {
    try {
        const users = await User.find({}).select('username email role _id');
        return res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ msg: 'Server error while fetching users.' });
    }
});

router.delete('/users/:id', protect, authorizeRoles(['admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({ msg: 'User not found.' });
        }

        res.status(200).json({ msg: 'User deleted successfully.', deletedUser });
    } catch (error) {
        res.status(500).json({ msg: 'Server error while deleting user.' });
    }
});

export default router;