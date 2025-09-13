// controllers/projectController.ts
import { Request, Response } from 'express';
import Project from '../models/Project';
import { AuthRequest } from './authMiddleware';

export const createProject = async (req: AuthRequest, res: Response) => {
  // Only 'admin' or 'project-manager' can create projects
  if (!['admin', 'project-manager'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const project = new Project(req.body);
  await project.save();
  res.status(201).json(project);
};

