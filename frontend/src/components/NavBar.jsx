import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext.jsx';

const NavBar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="brand">Streamin</div>
      <div className="links">
        <Link to="/">Home</Link>
        {user ? (
          <>
            <Link to="/upload">Upload</Link>
            <Link to="/my/uploads">My Uploads</Link>
            <Link to="/my/liked">My Liked</Link>
            <button className="link-button" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
