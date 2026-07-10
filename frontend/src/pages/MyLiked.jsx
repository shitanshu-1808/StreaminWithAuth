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

      <div className="table-panel">
        <div className="table-panel-header">
          <div>
            <p className="eyebrow">Liked Library</p>
            <h2>Saved tracks</h2>
          </div>
          <span className="table-meta">{songs.length} tracks</span>
        </div>

        {selectedSong && (
          <div className="table-panel mb-4">
            <div className="table-panel-header">
              <div>
                <p className="eyebrow">Now Playing</p>
                <h2>{selectedSong.title}</h2>
                <p className="table-meta">
                  {selectedSong.artist} • Plays: {selectedSong.playCount ?? 0}
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
          </div>
        )}

        {loading ? (
          <p className="table-loading">Loading liked songs...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : songs.length === 0 ? (
          <p className="table-loading">You haven't liked any songs yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="tracks-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Artist</th>
                  <th className="hide-on-mobile">Uploader</th>
                  <th className="hide-on-mobile text-center">Plays</th>
                  <th className="text-center">Score</th>
                  <th className="hide-on-mobile">Added</th>
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
                    <td>{song.artist}</td>
                    <td className="hide-on-mobile">{song.uploadedBy?.username || 'Unknown'}</td>
                    <td className="hide-on-mobile text-center">{song.playCount ?? 0}</td>
                    <td className="text-center">{song.score ?? 0}</td>
                    <td className="hide-on-mobile">{new Date(song.createdAt).toLocaleDateString()}</td>
                    <td className="vote-cell">
                      <button
                        className="button secondary"
                        onClick={() => voteSong(song, 'downvote')}
                      >
                        Dislike
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

export default MyLiked;
