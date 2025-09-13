// routes/userRoutes.ts
import express from 'express';
import { authenticate, authorize } from '../controllers/authMiddleware';
import { addUser, removeUser, getAllUsers, inviteUser, setPassword } from '../controllers/userController';
import { RequestHandler } from 'express';

const router = express.Router();

// This route is public for invited users to set their initial password
router.post('/users/set-password', setPassword as RequestHandler);

router.get('/users', authenticate as RequestHandler, authorize(['admin']) as RequestHandler, getAllUsers as RequestHandler);
router.post('/users/invite', authenticate as RequestHandler, authorize(['admin']) as RequestHandler, inviteUser as RequestHandler);
router.post('/users', authenticate as RequestHandler, authorize(['admin']) as RequestHandler, addUser as RequestHandler);
router.delete('/users/:id', authenticate as RequestHandler, authorize(['admin']) as RequestHandler, removeUser as RequestHandler);

export default router;
