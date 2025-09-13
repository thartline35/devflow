import express, { Request, Response, RequestHandler } from 'express';
import { authenticate } from '../controllers/authMiddleware';
import { createProject } from '../controllers/projectController'; // Assuming this exists

const router = express.Router();

router.post('/projects', authenticate, async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const userId = req.user.id;
  // Call the createProject controller to handle project creation
  await createProject(req, res);
});

// Add more routes as needed

export default router;
