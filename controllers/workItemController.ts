import { Request, Response } from 'express';
import WorkItem, { IComment } from '../models/WorkItem';
import Project from '../models/Project';
import mongoose from 'mongoose';

// Get all work items for a specific project
export const getWorkItemsForProject = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is a member of the project
    const isMember = project.members.some(memberId => memberId.toString() === req.user!.id);
    if (!isMember && req.user!.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: You are not a member of this project.' });
    }

    const workItems = await WorkItem.find({ projectId })
      .populate('assignedTo', 'username email')
      .populate('createdBy', 'username email')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username email'
        }
      });
    res.json(workItems);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Create a new work item within a project
export const createWorkItem = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { title, description, assignedTo } = req.body;
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Any member of the project can create work items
    const isMember = project.members.some(memberId => memberId.toString() === req.user!.id);
    if (!isMember && req.user!.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Only project members can add work items.' });
    }

    const workItem = new WorkItem({
      title,
      description,
      projectId,
      createdBy: req.user!.id,
      assignedTo: assignedTo || undefined,
    });

    await workItem.save();
    const populatedWorkItem = await WorkItem.findById(workItem._id)
        .populate('assignedTo', 'username email')
        .populate('createdBy', 'username email');
    res.status(201).json(populatedWorkItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Update a work item
export const updateWorkItem = async (req: Request, res: Response) => {
  try {
    const { workItemId } = req.params;
    const { title, description, status, assignedTo } = req.body;
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const workItem = await WorkItem.findById(workItemId).populate('projectId');
    if (!workItem) {
      return res.status(404).json({ message: 'Work item not found' });
    }

    const project = workItem.projectId as any; 
    const isMember = project.members.some((memberId: mongoose.Types.ObjectId) => memberId.toString() === req.user!.id);

    if (!isMember && req.user!.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: You do not have permission to update this item.' });
    }

    // Construct updates object
    const updates: any = {};
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (status) updates.status = status;
    if (assignedTo) updates.assignedTo = assignedTo;


    const updatedWorkItem = await WorkItem.findByIdAndUpdate(workItemId, updates, { new: true })
        .populate('assignedTo', 'username email')
        .populate('createdBy', 'username email');
        
    res.json(updatedWorkItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Add a comment to a work item
export const addCommentToWorkItem = async (req: Request, res: Response) => {
  try {
    const { workItemId } = req.params;
    const { content } = req.body; // Changed from 'text' to 'content'
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const workItem = await WorkItem.findById(workItemId).populate('projectId');
    if (!workItem) {
      return res.status(404).json({ message: 'Work item not found' });
    }

    const project = workItem.projectId as any;
    const isMember = project.members.some((memberId: mongoose.Types.ObjectId) => memberId.toString() === req.user!.id);

    if (!isMember && req.user!.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: You are not a member of this project.' });
    }

    const newComment = {
      content,
      author: new mongoose.Types.ObjectId(req.user!.id),
      createdAt: new Date(),
    };

    workItem.comments.push(newComment as IComment);
    await workItem.save();
    
    const populatedWorkItem = await WorkItem.findById(workItem._id)
        .populate({
            path: 'comments',
            populate: {
                path: 'author',
                select: 'username email'
            }
        });

    res.json(populatedWorkItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Create a new work item within a project
export const createWorkItem = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { title, description, assignedTo } = req.body;
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Any member of the project can create work items
    const isMember = project.members.some(memberId => memberId.toString() === req.user!.id);
    if (!isMember && req.user!.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Only project members can add work items.' });
    }

    const workItem = new WorkItem({
      title,
      description,
      projectId,
      createdBy: req.user!.id,
      assignedTo: assignedTo || undefined,
    });

    await workItem.save();
    const populatedWorkItem = await WorkItem.findById(workItem._id)
        .populate('assignedTo', 'username email')
        .populate('createdBy', 'username email');
    res.status(201).json(populatedWorkItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Update a work item
export const updateWorkItem = async (req: Request, res: Response) => {
  try {
    const { workItemId } = req.params;
    const { title, description, status, assignedTo } = req.body;
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const workItem = await WorkItem.findById(workItemId).populate('projectId');
    if (!workItem) {
      return res.status(404).json({ message: 'Work item not found' });
    }

    const project = workItem.projectId as any; 
    const isMember = project.members.some((memberId: mongoose.Types.ObjectId) => memberId.toString() === req.user!.id);

    if (!isMember && req.user!.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: You do not have permission to update this item.' });
    }

    // Construct updates object
    const updates: any = {};
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (status) updates.status = status;
    if (assignedTo) updates.assignedTo = assignedTo;


    const updatedWorkItem = await WorkItem.findByIdAndUpdate(workItemId, updates, { new: true })
        .populate('assignedTo', 'username email')
        .populate('createdBy', 'username email');
        
    res.json(updatedWorkItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Add a comment to a work item
export const addCommentToWorkItem = async (req: Request, res: Response) => {
  try {
    const { workItemId } = req.params;
    const { content } = req.body; // Changed from 'text' to 'content'
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const workItem = await WorkItem.findById(workItemId).populate('projectId');
    if (!workItem) {
      return res.status(404).json({ message: 'Work item not found' });
    }

    const project = workItem.projectId as any;
    const isMember = project.members.some((memberId: mongoose.Types.ObjectId) => memberId.toString() === req.user!.id);

    if (!isMember && req.user!.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: You are not a member of this project.' });
    }

    const newComment = {
      content,
      author: new mongoose.Types.ObjectId(req.user!.id),
      createdAt: new Date(),
    };

    workItem.comments.push(newComment as IComment);
    await workItem.save();
    
    const populatedWorkItem = await WorkItem.findById(workItem._id)
        .populate({
            path: 'comments',
            populate: {
                path: 'author',
                select: 'username email'
            }
        });

    res.json(populatedWorkItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
      return res.status(403).json({ message: 'Forbidden: You must be a project member to comment.' });
    }

    const comment = {
      text,
      author: new mongoose.Types.ObjectId(req.user!.id),
      createdAt: new Date(),
    };

    workItem.comments.push(comment as unknown as IComment);
    await workItem.save();
    res.status(201).json(workItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
