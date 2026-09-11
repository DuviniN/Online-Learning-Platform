import { useEffect, useState } from 'react';
import { getMyEnrollments } from '../api/enrollmentApi';

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
      <h1>My Enrollments</h1>
      {loading && <p>Loading…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && enrollments.length === 0 && <p>You haven't enrolled in any courses yet.</p>}

      <div className="card-grid">
        {enrollments.map((e) => (
          <div className="card" key={e._id}>
            <h2>{e.course?.title}</h2>
            <p>{e.course?.description}</p>
            <p className="muted">Enrolled on {new Date(e.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
