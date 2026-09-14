import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [term, setTerm] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(term.trim() ? `/?q=${encodeURIComponent(term.trim())}` : '/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand">Online Learning Platform</Link>

      {user && (
        <form className="search-bar navbar-search" onSubmit={handleSearch}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
               strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="search"
            placeholder="Search for anything"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
        </form>
      )}

      <div className="nav-links">
        <NavLink to="/" end>{user ? 'Courses' : 'Home'}</NavLink>
        {user?.role === 'student' && (
          <>
            <NavLink to="/my-enrollments">My Enrollments</NavLink>
            <NavLink to="/recommendations">Get Recommendations</NavLink>
          </>
        )}
        {user?.role === 'instructor' && <NavLink to="/instructor">My Courses</NavLink>}
        {user ? (
          <>
            <Link to="/profile" className="user-tag">
              <Avatar name={user.name} size={24} />
              {user.name}
            </Link>
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
