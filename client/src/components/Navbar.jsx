import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand">Online Learning Platform</Link>
      <div className="nav-links">
        <Link to="/">Courses</Link>
        {user?.role === 'student' && (
          <>
            <Link to="/my-enrollments">My Enrollments</Link>
            <Link to="/recommendations">Get Recommendations</Link>
          </>
        )}
        {user?.role === 'instructor' && <Link to="/instructor">My Courses</Link>}
        {user ? (
          <>
            <span className="user-tag">{user.name} ({user.role})</span>
            <button onClick={handleLogout}>Logout</button>
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
}
