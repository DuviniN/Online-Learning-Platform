import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllCourses } from '../api/courseApi';
import { enrollInCourse } from '../api/enrollmentApi';

export default function CourseCatalog() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrollingId, setEnrollingId] = useState(null);
  const [enrolledIds, setEnrolledIds] = useState(new Set());

  useEffect(() => {
    let cancelled = false;
    getAllCourses()
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

  const handleEnroll = async (courseId) => {
    setEnrollingId(courseId);
    setError('');
    try {
      await enrollInCourse(courseId);
      setEnrolledIds((prev) => new Set(prev).add(courseId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to enroll');
    } finally {
      setEnrollingId(null);
    }
  };

  return (
    <section className="dashboard">
      <h1>Course Catalog</h1>
      {loading && <p>Loading courses…</p>}
      {error && <p className="error">{error}</p>}

      {!loading && courses.length === 0 && <p>No courses have been posted yet.</p>}

      <div className="card-grid">
        {courses.map((course) => (
          <div className="card" key={course._id}>
            <h2><Link to={`/courses/${course._id}`}>{course.title}</Link></h2>
            <p>{course.description}</p>
            <p className="muted">Instructor: {course.instructor?.name}</p>
            <Link to={`/courses/${course._id}`}>View details →</Link>
            {user?.role === 'student' && (
              <button
                onClick={() => handleEnroll(course._id)}
                disabled={enrollingId === course._id || enrolledIds.has(course._id)}
              >
                {enrolledIds.has(course._id)
                  ? 'Enrolled'
                  : enrollingId === course._id
                  ? 'Enrolling…'
                  : 'Enroll'}
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
