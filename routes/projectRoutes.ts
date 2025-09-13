import express, { RequestHandler } from 'express';
import { authenticate } from '../controllers/authMiddleware';
import { 
  createProject, 
  getMyProjects, 
  addMemberToProject, 
  removeMemberFromProject 
} from '../controllers/projectController';

const router = express.Router();

// Get all projects for the logged-in user
router.get('/', authenticate as RequestHandler, getMyProjects as RequestHandler);

// Create a new project
router.post('/', authenticate as RequestHandler, createProject as RequestHandler);

// Add a member to a project
router.post('/:projectId/members', authenticate as RequestHandler, addMemberToProject as RequestHandler);

// Remove a member from a project
router.delete('/:projectId/members/:memberId', authenticate as RequestHandler, removeMemberFromProject as RequestHandler);

export default router;
