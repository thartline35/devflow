import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from '../routes/userRoutes';
import projectRoutes from '../routes/projectRoutes';
import { login, signup } from '../controllers/authController';
// Add other routes as needed, e.g., import projectRoutes from '../routes/projectRoutes';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI!)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Models (inline or import)
const WorkItemSchema = new mongoose.Schema({
  title: String,
  type: String,
  assignee: String,
  priority: String,
  storyPoints: Number,
  tags: [String],
  description: String,
  column: String,
});
const WorkItem = mongoose.model('WorkItem', WorkItemSchema);

const ActivitySchema = new mongoose.Schema({
  type: String,
  title: String,
  user: String,
  status: String,
  timestamp: { type: Date, default: Date.now },
});
const Activity = mongoose.model('Activity', ActivitySchema);

// Auth Routes
app.post('/api/auth/login', login);
app.post('/api/auth/signup', signup);

// Routes
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);

import { authenticate } from '../controllers/authMiddleware';

// WorkItem Routes (example)
app.get('/api/workitems', authenticate, async (req: Request, res: Response) => {
  const items = await WorkItem.find();
  res.json(items);
});

app.post('/api/workitems', authenticate, async (req, res) => {
  try {
    const item = new WorkItem(req.body);
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/workitems/:id', authenticate, async (req, res) => {
  try {
    const item = await WorkItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/workitems/:id', authenticate, async (req, res) => {
  try {
    const item = await WorkItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Activity Routes (similar CRUD, but simplified for logging)
app.get('/api/activities', authenticate, async (req, res) => {
  try {
    const activities = await Activity.find().sort({ timestamp: -1 });
    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/activities', authenticate, async (req, res) => {
  try {
    const activity = new Activity(req.body);
    await activity.save();
    res.json(activity);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Project Model
const ProjectSchema = new mongoose.Schema({
  name: String,
  description: String,
  createdBy: mongoose.Schema.Types.ObjectId,
});
const Project = mongoose.model('Project', ProjectSchema);

// Basic route example in projectRoutes.ts (create separately if needed)

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
