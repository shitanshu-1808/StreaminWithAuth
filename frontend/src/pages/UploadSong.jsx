import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext.jsx';
import api from '../api.js';

const UploadSong = () => {
  const { authHeaders } = useContext(AuthContext);
  const [form, setForm] = useState({ title: '', artist: '', youtubeUrl: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await api.post('/songs', form, { headers: authHeaders() });
      setMessage('Song uploaded successfully.');
      setForm({ title: '', artist: '', youtubeUrl: '' });
      navigate('/my/uploads');
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    }
  };

  return (
    <section className="page-container upload-page">
      <div className="upload-hero">
        <p className="eyebrow">Upload New Track</p>
        <h1>Share your latest music</h1>
        <p className="upload-copy">
          Add a new song to your playlist with a title, artist name, and YouTube link.
          Your track will appear in the creator dashboard with play counts, votes, and visibility for listeners.
        </p>
      </div>

      <div className="upload-card">
        <form onSubmit={handleSubmit} className="song-form">
          <div className="field-group">
            <label>Title</label>
            <input className="input-field" type="text" name="title" value={form.title} onChange={handleChange} required />
          </div>

          <div className="field-group">
            <label>Artist</label>
            <input className="input-field" type="text" name="artist" value={form.artist} onChange={handleChange} required />
          </div>

          <div className="field-group">
            <label>YouTube URL</label>
            <input className="input-field" type="url" name="youtubeUrl" value={form.youtubeUrl} onChange={handleChange} required />
          </div>

          {message && <p className="success upload-message">{message}</p>}
          {error && <p className="error upload-message">{error}</p>}

          <button className="button primary" type="submit">Upload Song</button>
        </form>
      </div>
    </section>
  );
};

export default UploadSong;
