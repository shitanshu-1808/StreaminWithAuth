import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import 'dotenv/config'; // Automatically loads environment variables

import authRoutes from './routes/authRoutes.js';
import songRoutes from './routes/songRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch(err => console.error('Database Connection Error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/songs', songRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));