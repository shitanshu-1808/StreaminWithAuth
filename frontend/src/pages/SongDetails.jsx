import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../AuthContext.jsx';
import api from '../api.js';

const SongDetails = () => {
  const { id } = useParams();
  const { authHeaders } = useContext(AuthContext);
  const [song, setSong] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSong = async () => {
      try {
        const response = await api.get(`/songs/${id}`);
        setSong(response.data);

        const playResponse = await api.put(`/songs/${id}/play`);
        setSong((prev) => ({
          ...response.data,
          playCount: playResponse.data.playCount,
        }));
      } catch (err) {
        setError('Could not load song details.');
      }
    };
    fetchSong();
  }, [id]);

  const vote = async (type) => {
    try {
      const response = await api.put(`/songs/${id}/${type}`, {}, { headers: authHeaders() });
      setSong((prev) => ({ ...prev, score: response.data.score, upvotes: response.data.upvotes, downvotes: response.data.downvotes }));
    } catch (err) {
      setError('Voting failed.');
    }
  };

  if (error) return <section className="page-container"><p className="error">{error}</p></section>;
  if (!song) return <section className="page-container"><p>Loading song...</p></section>;

  return (
    <section className="page-container song-page">
      <h1>{song.title}</h1>
      <p className="song-meta">{song.artist}</p>
      <p>Uploaded by: {song.uploadedBy?.username || 'Unknown'}</p>
      <p>{song.uploadedBy?.bio}</p>
      <div className="video-frame">
        <iframe
          src={`https://www.youtube.com/embed/${song.youtubeVideoId}`}
          title={song.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <div className="vote-actions">
        <button onClick={() => vote('upvote')}>Upvote</button>
        <button onClick={() => vote('downvote')}>Downvote</button>
      </div>
      <p className="song-meta">Plays: {song.playCount ?? 0}</p>
      <p className="score">Score: {song.score}</p>
    </section>
  );
};

export default SongDetails;
