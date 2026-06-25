import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">⚡</span>
          <span className="brand-text">TaskPulse</span>
        </Link>

        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="btn btn-ghost">
                Dashboard
              </Link>
              <div className="navbar-user">
                <div className="user-avatar">
                  {user?.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <span className="user-name">{user?.name}</span>
              </div>
              <button onClick={handleLogout} className="btn btn-ghost" id="logout-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost" id="nav-login-btn">
                Sign In
              </Link>
              <Link to="/login" className="btn btn-primary" id="nav-get-started-btn">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
