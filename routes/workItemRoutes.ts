import express from 'express';
import { authenticate } from '../controllers/authMiddleware';
import { 
  getWorkItemsForProject, 
  createWorkItem, 
  updateWorkItem, 
  addCommentToWorkItem 
} from '../controllers/workItemController';
import { RequestHandler } from 'express';

const router = express.Router({ mergeParams: true });

// Get all work items for a project
router.get('/', authenticate as RequestHandler, getWorkItemsForProject as RequestHandler);

// Create a new work item in a project
router.post('/', authenticate as RequestHandler, createWorkItem as RequestHandler);

// Update a specific work item
router.put('/:workItemId', authenticate as RequestHandler, updateWorkItem as RequestHandler);

// Add a comment to a specific work item
router.post('/:workItemId/comments', authenticate as RequestHandler, addCommentToWorkItem as RequestHandler);

export default router;
