import express from 'express';
import { authenticate, authorize } from '../controllers/authMiddleware';
import { createProject } from '../controllers/projectController';

const router = express.Router();

router.post('/', authenticate, authorize(['admin', 'project-manager']), createProject);

// Add GET, PUT, DELETE as needed

export default router;
