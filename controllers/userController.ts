// controllers/userController.ts
import { Request, Response } from 'express';
import User from '../models/User';

export const addUser = async (req: Request, res: Response) => {
  const user = new User(req.body);
  await user.save();
  res.json({ message: 'User added' });
};

export const removeUser = async (req: Request, res: Response) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User removed' });
};

// Update a user (Admin only)
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const user = await User.findByIdAndUpdate(id, updates, { new: true });
    res.json({ message: 'User updated successfully', user });
  } catch (err: any) {
    res.status(400).json({ message: 'Error updating user', error: err.message });
  }
};

// Get all users (Admin only)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err: any) {
    res.status(400).json({ message: 'Error fetching users', error: err.message });
  }
};
