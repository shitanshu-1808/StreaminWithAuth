import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';

const router = express.Router();

const isValidEmail = (email) => {
  const regex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return regex.test(email);
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const verificationEnabled = () => Boolean(process.env.BREVO_API_KEY);

const sendVerificationEmail = async (recipientEmail, username, otp) => {
  if (!verificationEnabled()) return null;

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: {
        name: 'Streamin',
        email: process.env.BREVO_FROM_EMAIL || 'no-reply@streamin.app',
      },
      to: [{ email: recipientEmail, name: username }],
      subject: 'Your Streamin verification code',
      htmlContent: `
        <p>Hello ${username},</p>
        <p>Your Streamin verification code is:</p>
        <h2>${otp}</h2>
        <p>Enter this code to complete your registration.</p>
      `,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Brevo email failed: ${response.status} ${errorText}`);
  }

  return true;
};

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, bio } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      // If the existing user is unverified, update their details and resend OTP
      if (!userExists.isVerified && verificationEnabled()) {
        userExists.username = username;
        userExists.email = email;
        userExists.password = password;
        if (bio) userExists.bio = bio;

        const otp = crypto.randomInt(100000, 999999).toString();
        userExists.otp = otp;
        userExists.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        await userExists.save();

        await sendVerificationEmail(userExists.email, userExists.username, otp);

        return res.status(200).json({
          _id: userExists._id,
          username: userExists.username,
          email: userExists.email,
          isVerified: false,
          requiresVerification: true,
          message: 'A new verification code has been sent to your email.',
        });
      }

      return res.status(400).json({ message: 'User with that email or username already exists' });
    }

    const enabled = verificationEnabled();
    const otp = enabled ? crypto.randomInt(100000, 999999).toString() : null;
    const otpExpires = enabled ? new Date(Date.now() + 10 * 60 * 1000) : null;

    const user = await User.create({
      username,
      email,
      password,
      bio,
      isVerified: !enabled,
      otp,
      otpExpires,
    });

    if (enabled) {
      await sendVerificationEmail(user.email, user.username, otp);
    }

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      isVerified: user.isVerified,
      requiresVerification: enabled,
      message: enabled ? 'Account created. Please enter the OTP sent to your email to verify your account.' : 'Account created successfully',
    });
  } catch (error) {
    console.error('REGISTER ERROR:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/verify-email', async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ message: 'User ID and OTP are required' });
    }

    const user = await User.findById(userId).select('+otp');
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (!user.otp || !user.otpExpires || user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'OTP is invalid or has expired. Please request a new code.' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Incorrect OTP' });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.json({
      message: 'Email verified successfully',
      _id: user._id,
      username: user.username,
      email: user.email,
      isVerified: true,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/resend-otp', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendVerificationEmail(user.email, user.username, otp);

    res.json({ message: 'A new verification code has been sent to your email.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      if (verificationEnabled() && !user.isVerified) {
        // Generate a fresh OTP and send it so the user can verify now
        const otp = crypto.randomInt(100000, 999999).toString();
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        try {
          await sendVerificationEmail(user.email, user.username, otp);
        } catch (emailErr) {
          console.error('Failed to send OTP email on login:', emailErr);
        }

        return res.status(403).json({
          message: 'Please verify your email. A new verification code has been sent.',
          _id: user._id,
          email: user.email,
          requiresVerification: true,
        });
      }

      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;