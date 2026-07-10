import express from 'express';
import Song from '../models/Song.js';
import { protect, extractVoter } from '../middleware/authMiddleware.js';

const router = express.Router();

const extractYoutubeId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

router.get('/', async (req, res) => {
  try {
    const songs = await Song.find()
      .sort({ score: -1 })
      .populate('uploadedBy', 'username');
    res.json(songs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/my/uploads', protect, async (req, res) => {
  try {
    const songs = await Song.find({ uploadedBy: req.user.id })
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'username');
    res.json(songs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/my/liked', protect, async (req, res) => {
  try {
    const songs = await Song.find({ upvotes: req.user.id })
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'username');
    res.json(songs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id).populate('uploadedBy', 'username bio');
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }
    res.json(song);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/play', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    song.playCount = (song.playCount || 0) + 1;
    await song.save();

    res.json({ playCount: song.playCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { youtubeUrl, title, artist } = req.body;

    if (!title || !artist || !youtubeUrl) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const videoId = extractYoutubeId(youtubeUrl);
    if (!videoId) {
      return res.status(400).json({ message: 'Invalid YouTube URL' });
    }

    const songExists = await Song.findOne({ youtubeVideoId: videoId });
    if (songExists) {
      return res.status(400).json({ message: 'This song has already been shared' });
    }

    console.log('Upload request:', { title, artist, youtubeVideoId: videoId, uploadedBy: req.user?.id });
    const song = await Song.create({
      title,
      artist,
      youtubeVideoId: videoId,
      uploadedBy: req.user.id,
    });
    console.log('Song created successfully:', song._id);

    res.status(201).json(song);
  } catch (error) {
    console.error('Song upload error:', error.stack || error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/upvote', extractVoter, async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ message: 'Song not found' });

    if (song.upvotes.includes(req.voterId)) {
      song.upvotes = song.upvotes.filter((id) => id !== req.voterId);
    } else {
      song.upvotes.push(req.voterId);
      song.downvotes = song.downvotes.filter((id) => id !== req.voterId);
    }

    await song.save(); // Triggers schema pre-save hook to recalculate net score
    res.json({ score: song.score, upvotes: song.upvotes, downvotes: song.downvotes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/downvote', extractVoter, async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ message: 'Song not found' });

    if (song.downvotes.includes(req.voterId)) {
      song.downvotes = song.downvotes.filter((id) => id !== req.voterId);
    } else {
      song.downvotes.push(req.voterId);
      song.upvotes = song.upvotes.filter((id) => id !== req.voterId);
    }

    await song.save(); // Triggers schema pre-save hook to recalculate net score
    res.json({ score: song.score, upvotes: song.upvotes, downvotes: song.downvotes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;