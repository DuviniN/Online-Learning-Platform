import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyEnrollments } from '../api/enrollmentApi';
import CourseCard from '../components/CourseCard';
import EmptyState from '../components/EmptyState';

export default function MyEnrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    getMyEnrollments()
      .then((data) => {
        if (!cancelled) setEnrollments(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load enrollments');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>My Enrollments</h1>
          <p className="muted">Courses you're currently enrolled in.</p>
        </div>
      </div>

      {!loading && enrollments.length > 0 && (
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-value">{enrollments.length}</div>
            <div className="stat-label">Enrolled courses</div>
          </div>
        </div>
      )}

      {loading && <p>Loading…</p>}
      {error && <p className="error">{error}</p>}

      {!loading && enrollments.length === 0 && (
        <EmptyState
          icon={
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor"
                 strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19a1 1 0 0 1 1 1v14.5a1 1 0 0 1-1 1H6.5A2.5 2.5 0 0 0 4 22V5.5Z M4 17.5A2.5 2.5 0 0 1 6.5 15H20" />
            </svg>
          }
          title="No enrollments yet"
          text="Browse the catalog and enroll in a course to see it here."
          action={<Link to="/" className="btn-primary">Browse courses</Link>}
        />
      )}

      <div className="course-grid">
        {enrollments.map((e) => (
          <CourseCard
            key={e._id}
            course={e.course}
            footer={<span className="muted">Enrolled {new Date(e.createdAt).toLocaleDateString()}</span>}
          />
        ))}
      </div>
    </section>
  );
}
