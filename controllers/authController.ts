// controllers/authController.ts

// Controller for authentication-related operations

import { Request, Response } from 'express'; // Importing types for Express request and response
import bcrypt from 'bcryptjs'; // Importing bcrypt for password hashing
import jwt from 'jsonwebtoken'; // Importing jsonwebtoken for JWT operations
import User from '../models/User'; // Importing the User model

export const signup = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Determine role: first user is admin, others are users
    const userCount = await User.countDocuments();
    const role = userCount === 0 ? 'admin' : 'user';
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ 
      username, 
      email, 
      password: hashedPassword, 
      role: role
    });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const login = async (req: Request, res: Response) => {
  console.log('Login request received:', req.body.email);
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  // If user has no password, they need to set it up
  if (!user.password) {
    return res.json({ passwordSetupRequired: true, email: user.email });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ 
    id: user._id,
    _id: user._id, // Include _id for compatibility with other parts of the app
    email: user.email,
    username: user.username,
    role: user.role || 'user' 
    }, 
    process.env.JWT_SECRET!, { expiresIn: '1h' });
  res.json({ token, user: { id: user._id, _id: user._id, role: user.role, username: user.username } });
};
