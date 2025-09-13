// routes/userRoutes.ts
import express from 'express';
import { authenticate, authorize } from '../controllers/authMiddleware';
import { addUser, removeUser } from '../controllers/userController';
import { RequestHandler } from 'express';

const router = express.Router();

router.post('/users', authenticate as RequestHandler, authorize(['admin']) as RequestHandler, addUser as RequestHandler);
router.delete('/users/:id', authenticate as RequestHandler, authorize(['admin']) as RequestHandler, removeUser as RequestHandler);

export default router;
