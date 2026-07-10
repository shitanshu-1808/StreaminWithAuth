import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../AuthContext.jsx';
import api from '../api.js';

const MyUploads = () => {
  const { authHeaders } = useContext(AuthContext);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMySongs = async () => {
      try {
        const response = await api.get('/songs/my/uploads', { headers: authHeaders() });
        setSongs(response.data);
      } finally {
        setLoading(false);
      }
    };
    fetchMySongs();
  }, [authHeaders]);

  return (
    <section className="dashboard-shell">
      <div className="dashboard-header">
        <div>
          <p className="eyebrow">My Uploads</p>
          <h1>Your track collection</h1>
          <p className="dashboard-description">
            Review your uploaded songs with play counts, score data, and easy navigation for later edits.
          </p>
        </div>
      </div>

      <div className="table-panel">
        <div className="table-panel-header">
          <div>
            <p className="eyebrow">Your Library</p>
            <h2>Uploaded tracks</h2>
          </div>
          <span className="table-meta">{songs.length} tracks</span>
        </div>

        {loading ? (
          <p className="table-loading">Loading your uploads...</p>
        ) : songs.length === 0 ? (
          <p className="table-loading">You haven't uploaded any songs yet.</p>
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
                    <span className="track-uploader">
                      Plays: {song.playCount ?? 0} • Score: {song.score ?? 0} • Added: {new Date(song.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default MyUploads;
