import mongoose from 'mongoose';

const songSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    artist: { type: String, required: true, trim: true },
    youtubeVideoId: { type: String, required: true, unique: true, trim: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    upvotes: { type: [String], default: [] },
    downvotes: { type: [String], default: [] },
    playCount: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
  },
  { timestamps: true }
);

songSchema.index({ score: -1 });

songSchema.pre('save', function () {
  this.score = this.upvotes.length - this.downvotes.length;
});

const Song = mongoose.model('Song', songSchema);
export default Song; // ES Module Export