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

export default MyUploads;
