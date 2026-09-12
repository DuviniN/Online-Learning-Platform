import { NavLink, Link, useNavigate } from 'react-router-dom';
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
        <NavLink to="/" end>Courses</NavLink>
        {user?.role === 'student' && (
          <>
            <NavLink to="/my-enrollments">My Enrollments</NavLink>
            <NavLink to="/recommendations">Get Recommendations</NavLink>
          </>
        )}
        {user?.role === 'instructor' && <NavLink to="/instructor">My Courses</NavLink>}
        {user ? (
          <>
            <span className="user-tag">{user.name} ({user.role})</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <Link to="/register" className="btn-primary">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
