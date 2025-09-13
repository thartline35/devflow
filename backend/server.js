import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// WorkItem Model
const WorkItemSchema = new mongoose.Schema({
  id: String,
  title: String,
  type: String,
  assignee: String,
  priority: String,
  storyPoints: Number,
  tags: [String],
  description: String,
  column: String, // e.g., "To Do"
});
const WorkItem = mongoose.model('WorkItem', WorkItemSchema);

// Activity Model
const ActivitySchema = new mongoose.Schema({
  type: String,
  title: String,
  user: String,
  status: String,
  timestamp: { type: Date, default: Date.now },
});
const Activity = mongoose.model('Activity', ActivitySchema);

// WorkItem Routes
app.get('/api/workitems', async (req, res) => {
  try {
    const items = await WorkItem.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/workitems', async (req, res) => {
  try {
    const item = new WorkItem(req.body);
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/workitems/:id', async (req, res) => {
  try {
    const item = await WorkItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/workitems/:id', async (req, res) => {
  try {
    const item = await WorkItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Activity Routes (similar CRUD, but simplified for logging)
app.get('/api/activities', async (req, res) => {
  try {
    const activities = await Activity.find().sort({ timestamp: -1 });
    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/activities', async (req, res) => {
  try {
    const activity = new Activity(req.body);
    await activity.save();
    res.json(activity);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));
