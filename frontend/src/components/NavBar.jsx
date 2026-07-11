import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../AuthContext.jsx';

const NavBar = () => {
  const { user } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  const displayName = user?.name || user?.username || '';
  const initials = displayName
    ? displayName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <nav className="navbar">
      {/* ── Left: Brand ── */}
      <Link to="/" className="brand" onClick={closeMenu}>Streamin</Link>

      {/* ── Middle: Nav links (collapses on mobile) ── */}
      <div className={`links ${isMenuOpen ? 'show' : ''}`}>
        <Link to="/" onClick={closeMenu}>Home</Link>
        {user ? (
          <>
            <Link to="/upload" onClick={closeMenu}>Upload</Link>
            <Link to="/my/uploads" onClick={closeMenu}>My Uploads</Link>
            <Link to="/my/liked" onClick={closeMenu}>My Liked</Link>
          </>
        ) : (
          <>
            <Link to="/login" onClick={closeMenu}>Login</Link>
            <Link to="/register" onClick={closeMenu}>Register</Link>
          </>
        )}
      </div>

      {/* ── Right: Profile icon + Hamburger ── */}
      <div className="navbar-right">
        {user && (
          <Link
            to="/profile"
            className="nav-profile-btn"
            title={`Profile: ${displayName}`}
            aria-label="Open profile"
            onClick={closeMenu}
          >
            <span className="nav-profile-initials">{initials}</span>
          </Link>
        )}

        <button
          className={`mobile-menu-btn ${isMenuOpen ? 'open' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
      </div>
    </nav>
  );
};

export default NavBar;
