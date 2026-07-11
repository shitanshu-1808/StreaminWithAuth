import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../AuthContext.jsx';
import api from '../api.js';

const MyLiked = () => {
  const { authHeaders } = useContext(AuthContext);
  const [songs, setSongs] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [playerLoading, setPlayerLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [votingSongs, setVotingSongs] = useState({});

  useEffect(() => {
    const fetchLikedSongs = async () => {
      try {
        setError('');
        const response = await api.get('/songs/my/liked', { headers: authHeaders() });
        setSongs(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load liked songs.');
      } finally {
        setLoading(false);
      }
    };
    fetchLikedSongs();
  }, [authHeaders]);

  const handlePlaySong = async (song) => {
    setError('');
    setSelectedSong(song);
    setPlayerLoading(true);

    try {
      const response = await api.put(`/songs/${song._id}/play`);
      const updatedSong = { ...song, playCount: response.data.playCount };
      setSelectedSong(updatedSong);
      setSongs((prev) => prev.map((item) => (item._id === song._id ? updatedSong : item)));
    } catch (err) {
      setError('Unable to play the selected track.');
    } finally {
      setPlayerLoading(false);
    }
  };

  const voteSong = async (song, type) => {
    if (votingSongs[song._id]) return;

    setVotingSongs((prev) => ({ ...prev, [song._id]: true }));
    try {
      const response = await api.put(`/songs/${song._id}/${type}`, {}, { headers: authHeaders() });
      const updatedSong = {
        ...song,
        score: response.data.score,
        upvotes: response.data.upvotes,
        downvotes: response.data.downvotes,
      };
      setSelectedSong((prev) => (prev?._id === song._id ? updatedSong : prev));

      if (type === 'downvote') {
        setSongs((prev) => prev.filter((item) => item._id !== song._id));
      } else {
        setSongs((prev) => prev.map((item) => (item._id === song._id ? updatedSong : item)));
      }
    } catch (err) {
      setError('Unable to update song vote.');
    } finally {
      setVotingSongs((prev) => ({ ...prev, [song._id]: false }));
    }
  };

  return (
    <section className="dashboard-shell">
      <div className="dashboard-header">
        <div>
          <p className="eyebrow">Liked Songs</p>
          <h1>Your favorites</h1>
          <p className="dashboard-description">
            All songs you've liked are surfaced here so you can revisit tracks and monitor their performance.
          </p>
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
          {error && <p className="error">{error}</p>}
        </div>
      )}

      <div className="table-panel">
        <div className="table-panel-header">
          <div>
            <p className="eyebrow">Liked Library</p>
            <h2>Saved tracks</h2>
          </div>
          <span className="table-meta">{songs.length} tracks</span>
        </div>

        {loading ? (
          <p className="table-loading">Loading liked songs...</p>
        ) : error && songs.length === 0 ? (
          <p className="error">{error}</p>
        ) : songs.length === 0 ? (
          <p className="table-loading">You haven't liked any songs yet.</p>
        ) : (
          <div className="tracks-list">
            {songs.map((song, index) => (
              <div className="track-card" key={song._id}>
                <div className="track-card-left">
                  <div className="track-avatar-wrapper">
                    <div className="track-number">{index + 1}</div>
                    <div className="track-avatar" />
                  </div>
                  <div className="track-info">
                    <span className="track-name">{song.title}</span>
                    <span className="track-artist">{song.artist}</span>
                    <span className="track-uploader">{song.uploadedBy?.username || 'Unknown'}</span>
                  </div>
                </div>
                <div className="track-actions">
                  <button
                    className="icon-btn"
                    onClick={() => voteSong(song, 'upvote')}
                    disabled={votingSongs[song._id]}
                  >
                    👍 {Intl.NumberFormat('en', { notation: 'compact' }).format(song.score ?? 0)}
                  </button>
                  <button
                    className="icon-btn"
                    onClick={() => voteSong(song, 'downvote')}
                    disabled={votingSongs[song._id]}
                  >
                    👎
                  </button>
                  <button
                    className="play-btn"
                    onClick={() => handlePlaySong(song)}
                    disabled={playerLoading && selectedSong?._id === song._id}
                  >
                    ▶
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default MyLiked;
