import { useContext } from 'react';
import { AuthContext } from '../AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  const displayName = user.name || user.username || 'User';
  const email = user.email || 'No email on record';
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <section className="profile-page">
      {/* Decorative background orb */}
      <div className="profile-bg-orb" aria-hidden="true" />

      <div className="profile-card">
        {/* Avatar */}
        <div className="profile-avatar" aria-label={`${displayName} avatar`}>
          <span className="profile-avatar-initials">{initials}</span>
          <div className="profile-avatar-ring" />
        </div>

        {/* Info */}
        <div className="profile-info">
          <p className="eyebrow">Your Account</p>
          <h1 className="profile-name">{displayName}</h1>

          <div className="profile-fields">
            <div className="profile-field">
              <span className="profile-field-icon">✉</span>
              <div>
                <p className="profile-field-label">Email Address</p>
                <p className="profile-field-value">{email}</p>
              </div>
            </div>

            <div className="profile-field">
              <span className="profile-field-icon">👤</span>
              <div>
                <p className="profile-field-label">Display Name</p>
                <p className="profile-field-value">{displayName}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="profile-actions">
          <button className="button secondary" onClick={() => navigate(-1)}>
            ← Go Back
          </button>
          <button className="button primary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </section>
  );
};

export default Profile;
