import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../AuthContext.jsx';
import api from '../api.js';

const Home = () => {
  const { authHeaders } = useContext(AuthContext);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSong, setSelectedSong] = useState(null);
  const [playerLoading, setPlayerLoading] = useState(false);
  const [playerError, setPlayerError] = useState('');

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await api.get('/songs');
        setSongs(response.data);
      } catch (err) {
        console.error('Songs fetch error:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load songs');
      } finally {
        setLoading(false);
      }
    };
    fetchSongs();
  }, []);

  const totalUploads = songs.length;
  const totalLikes = songs.reduce((sum, song) => sum + (song.upvotes?.length || 0), 0);
  const totalPlays = songs.reduce((sum, song) => sum + (song.playCount || 0), 0);
  const topTrack = songs
    .slice()
    .sort((a, b) => (b.score || 0) - (a.score || 0))[0]?.title || 'No track yet';

  const handlePlaySong = async (song) => {
    setPlayerError('');
    setSelectedSong(song);
    setPlayerLoading(true);

    try {
      const response = await api.put(`/songs/${song._id}/play`);
      const updatedSong = { ...song, playCount: response.data.playCount };
      setSelectedSong(updatedSong);
      setSongs((prev) => prev.map((item) => (item._id === song._id ? updatedSong : item)));
    } catch (err) {
      setPlayerError('Unable to play the selected track.');
    } finally {
      setPlayerLoading(false);
    }
  };

  const voteSong = async (song, type) => {
    try {
      const response = await api.put(`/songs/${song._id}/${type}`, {}, { headers: authHeaders() });
      const updatedSong = {
        ...song,
        score: response.data.score,
        upvotes: response.data.upvotes,
        downvotes: response.data.downvotes,
      };
      setSongs((prev) => prev.map((item) => (item._id === song._id ? updatedSong : item)));
      if (selectedSong?._id === song._id) {
        setSelectedSong(updatedSong);
      }
    } catch (err) {
      setPlayerError('Unable to update vote.');
    }
  };

  return (
    <section className="dashboard-shell">
      <div className="dashboard-header">
        <div>
          <p className="eyebrow">Creator Studio</p>
          <h1>My Uploaded Songs</h1>
          <p className="dashboard-description">
            Manage your discography, track your performance, and see how listeners are interacting with your sound in real-time.
          </p>
        </div>
        <div className="hero-actions">
          <Link to="/upload" className="button primary">New Upload</Link>
        </div>
      </div>

      {selectedSong && (
        <div className="table-panel">
          <div className="table-panel-header">
            <div>
              <p className="eyebrow">Now Playing</p>
              <h2>{selectedSong.title}</h2>
              <p className="table-meta">
                {selectedSong.artist} • Plays: {selectedSong.playCount ?? 0}
              </p>
              <p className="table-meta">
                Uploaded by: {selectedSong.uploadedBy?.username || 'Unknown'}
              </p>
            </div>
          </div>
          <div className="player-video">
            <iframe
              src={`https://www.youtube.com/embed/${selectedSong.youtubeVideoId}?autoplay=1&rel=0`}
              title={selectedSong.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          {playerError && <p className="error">{playerError}</p>}
        </div>
      )}

      <div className="stats-grid">
        <article className="metric-card">
          <span className="metric-label">Total Uploads</span>
          <strong>{totalUploads}</strong>
        </article>
        <article className="metric-card">
          <span className="metric-label">Total Likes</span>
          <strong>{totalLikes.toLocaleString()}</strong>
        </article>
        <article className="metric-card">
          <span className="metric-label">Total Plays</span>
          <strong>{totalPlays.toLocaleString()}</strong>
        </article>
        <article className="metric-card">
          <span className="metric-label">Top Track</span>
          <strong>{topTrack}</strong>
        </article>
      </div>

      <div className="table-panel">
        <div className="table-panel-header">
          <div>
            <p className="eyebrow">Recent Uploads</p>
            <h2>Track Library</h2>
          </div>
          <span className="table-meta">{songs.length} tracks</span>
        </div>

        {loading ? (
          <p className="table-loading">Loading your tracks...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : songs.length === 0 ? (
          <p className="table-loading">No uploads yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="tracks-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th className="hide-on-mobile">Artist</th>
                  <th className="hide-on-mobile">Added</th>
                  <th className="mobile-text-center">Uploader</th>
                  <th className="hide-on-mobile text-center">Plays</th>
                  <th className="text-center">Score</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {songs.map((song, index) => (
                  <tr key={song._id}>
                    <td>{index + 1}</td>
                    <td>
                      <div className="track-title-cell">
                        <div className="track-avatar" />
                        <div>
                          <span className="track-name">{song.title}</span>
                          <span className="track-subtitle">{song.artist}</span>
                        </div>
                      </div>
                    </td>
                    <td className="hide-on-mobile">{song.artist}</td>
                    <td className="hide-on-mobile">{new Date(song.createdAt).toLocaleDateString()}</td>
                    <td className="mobile-text-center">{song.uploadedBy?.username || 'Unknown'}</td>
                    <td className="hide-on-mobile text-center">{song.playCount ?? 0}</td>
                    <td className="text-center">{song.score ?? 0}</td>
                    <td className="vote-cell">
                      <button
                        className="button secondary"
                        onClick={() => voteSong(song, 'upvote')}
                      >
                        👍
                      </button>
                      <button
                        className="button secondary"
                        onClick={() => voteSong(song, 'downvote')}
                      >
                        👎
                      </button>
                      <button
                        className="button primary"
                        onClick={() => handlePlaySong(song)}
                        disabled={playerLoading && selectedSong?._id === song._id}
                      >
                        {playerLoading && selectedSong?._id === song._id ? 'Loading...' : 'Play'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default Home;
