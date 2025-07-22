import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import institutionRoute from './routes/institution.js';
import reviewRoute from './routes/review.js';
import courseRoutes from './routes/courseRoute.js';
import entranceExamRoutes from './routes/entranceExamRoute.js';
import pageViewSchema from './routes/PageViews.js';
import profileRoutes from './routes/profile.js';
import userRoute from './routes/users.js';

dotenv.config();

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use(express.json());
app.use(cookieParser());

app.use("/api/pageviews", pageViewSchema);
app.use('/api/profile', profileRoutes);
app.use("/api/auth", authRoutes);
app.use('/api/reviews', reviewRoute);
app.use("/api/courses", courseRoutes);
app.use("/api/user", userRoute);
app.use("/api/entrance-exams", entranceExamRoutes);
app.use("/api/institutions", institutionRoute);

app.get('/', (req, res) => {
    res.send('API is running...');
});

const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        app.listen(5000, () => {});
    } catch (error) {
        process.exit(1);
    }
};
startServer();