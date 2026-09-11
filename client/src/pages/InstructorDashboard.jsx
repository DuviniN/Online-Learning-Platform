import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyCourses } from '../api/courseApi';

export default function InstructorDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getMyCourses()
      .then((data) => {
        if (!cancelled) setCourses(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load courses');
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
          <h1>Instructor Dashboard</h1>
          <p>Welcome, {user?.name}.</p>
        </div>
        <Link to="/instructor/courses/new" className="btn-primary">
          + Add New Course
        </Link>
      </div>

      {loading && <p>Loading your courses…</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && courses.length === 0 && (
        <p>You haven't posted any courses yet. Create your first one above.</p>
      )}

      {!loading && courses.length > 0 && (
        <div className="card-grid">
          {courses.map((course) => (
            <div className="card" key={course._id}>
              <h2>{course.title}</h2>
              <p>{course.description}</p>
              <Link to={`/instructor/courses/${course._id}`}>Manage course →</Link>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
