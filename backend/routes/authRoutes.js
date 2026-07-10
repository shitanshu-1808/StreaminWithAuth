import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

const isValidEmail = (email) => {
  const regex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return regex.test(email);
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

router.post('/register', async (req, res) => {
  try {
    console.log("Request Body:", req.body);

    const { username, email, password, bio } = req.body;

    console.log("Checking existing user...");
    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    console.log("User exists:", userExists);

    console.log("Creating user...");
    const user = await User.create({ username, email, password, bio });

    console.log("User created:", user);

    console.log("Generating token...");
    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token,
    });
  } catch (error) {
    console.error("REGISTER ERROR:");
    console.error(error);
    console.error(error.stack);

    res.status(500).json({
      error: error.message,
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router; // ES Module Export