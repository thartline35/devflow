// controllers/projectController.ts
import { Request, Response } from 'express';
import Project from '../models/Project';

export const createProject = async (req: Request, res: Response) => {
  if (!req.user) return res.status(403).json({ message: 'Forbidden' });
  // Only 'admin' or 'project-manager' can create projects
  if (!['admin', 'project-manager'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const project = new Project({ ...req.body, createdBy: req.user.id });
  await project.save();
  res.status(201).json(project);
};

