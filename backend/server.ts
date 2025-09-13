import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from '../routes/userRoutes';
import projectRoutes from '../routes/projectRoutes';
import workItemRoutes from '../routes/workItemRoutes';
import authRoutes from '../routes/authRoutes';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Remove inline models for WorkItem, Activity, and Project
// These are now defined in their own files under /models

mongoose.connect(process.env.MONGO_URI!)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Auth Routes
app.use('/api/auth', authRoutes);

// Main Routes
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);

// Nested WorkItem Routes
app.use('/api/projects/:projectId/workitems', workItemRoutes);

// Remove old inline /api/workitems and /api/activities routes

// A simple catch-all for the root to confirm the server is running
app.get('/', (req, res) => {
  res.send('DevFlow API is running!');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
