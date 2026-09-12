import { useEffect, useState } from 'react';
import { getMyEnrollments } from '../api/enrollmentApi';
import CourseCard from '../components/CourseCard';

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
      {!loading && enrollments.length === 0 && <p>You haven't enrolled in any courses yet.</p>}

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
