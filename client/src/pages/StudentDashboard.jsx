import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyEnrollments } from '../api/enrollmentApi';

const ACTIONS = [
  {
    to: '/',
    title: 'Browse Courses',
    text: 'Explore the full catalog and find something new to learn.',
    icon: (
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19a1 1 0 0 1 1 1v14.5a1 1 0 0 1-1 1H6.5A2.5 2.5 0 0 0 4 22V5.5Z M4 17.5A2.5 2.5 0 0 1 6.5 15H20" />
    ),
  },
  {
    to: '/my-enrollments',
    title: 'My Enrollments',
    text: 'Track every course you have joined so far.',
    icon: <path d="m5 12.5 4.5 4.5L19 7" />,
  },
  {
    to: '/recommendations',
    title: 'AI Recommendations',
    text: 'Describe a goal and get matched with real courses.',
    icon: <path d="M12 2.5 13.8 8l5.7.2-4.5 3.6 1.7 5.6L12 14l-4.7 3.4 1.7-5.6-4.5-3.6L10.2 8Z" />,
  },
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const [count, setCount] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getMyEnrollments()
      .then((data) => {
        if (!cancelled) setCount(data.length);
      })
      .catch(() => {
        if (!cancelled) setCount(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="dashboard">
      <h1>Welcome back, {user?.name}</h1>
      <p className="muted">Pick up where you left off, or find something new to learn.</p>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value">{count ?? '—'}</div>
          <div className="stat-label">Enrolled courses</div>
        </div>
      </div>

      <div className="quick-actions">
        {ACTIONS.map((a) => (
          <Link to={a.to} className="quick-action-card" key={a.to}>
            <span className="quick-action-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
                   strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                {a.icon}
              </svg>
            </span>
            <div>
              <h2>{a.title}</h2>
              <p>{a.text}</p>
            </div>
            <span className="quick-action-arrow">→</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
