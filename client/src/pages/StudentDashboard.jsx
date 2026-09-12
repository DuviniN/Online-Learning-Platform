import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyEnrollments } from '../api/enrollmentApi';

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

      <div className="dashboard-actions">
        <Link to="/" className="btn-primary">Browse courses</Link>
        <Link to="/my-enrollments" className="btn-outline">My enrollments</Link>
        <Link to="/recommendations" className="btn-outline">Get AI recommendations</Link>
      </div>
    </section>
  );
}
