import { Request, Response } from 'express';
import Project from '../models/Project';
import User from '../models/User';

// Get all projects a user is associated with
export const getMyProjects = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const projects = await Project.find({
      $or: [
        { createdBy: req.user.id },
        { members: req.user.id }
      ]
    }).populate('createdBy', 'username email').populate('members', 'username email');
    
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createProject = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const { name, description } = req.body;
    const project = new Project({
      name,
      description,
      createdBy: req.user.id,
      members: [req.user.id] // Creator is automatically a member
    });

    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Add a member to a project
export const addMemberToProject = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { email } = req.body;
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only project creator or admin can add members
    if (project.createdBy?.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Only the project creator can add members.' });
    }

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (project.members.includes(userToAdd.id)) {
      return res.status(400).json({ message: 'User is already a member of this project.' });
    }

    project.members.push(userToAdd.id);
    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Remove a member from a project
export const removeMemberFromProject = async (req: Request, res: Response) => {
  try {
    const { projectId, memberId } = req.params;
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only project creator or admin can remove members
    if (project.createdBy?.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Only the project creator can remove members.' });
    }
    
    // Prevent creator from being removed
    if (project.createdBy?.toString() === memberId) {
        return res.status(400).json({ message: 'The project creator cannot be removed.' });
    }

    project.members = project.members.filter(id => id.toString() !== memberId);
    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};


