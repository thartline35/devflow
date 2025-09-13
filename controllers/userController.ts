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
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    res.status(400).json({ message: 'Error updating user', error: errorMessage });
  }
};

export const inviteUser = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    const newUser = new User({
      email,
      username: email.split('@')[0], // Default username from email
      role: 'user',
      // No password, user will set it on first login
    });

    await newUser.save();
    res.status(201).json({ message: 'User invited successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get all users (Admin only)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    res.status(400).json({ message: 'Error fetching users', error: errorMessage });
  }
};

export const setPassword = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // If user already has a password, this endpoint should not be used.
    if (user.password) {
      return res.status(400).json({ message: 'Password has already been set.' });
    }

    user.password = password; // The pre-save hook in User.ts will hash it
    await user.save();

    res.status(200).json({ message: 'Password set successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
