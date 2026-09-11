import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCourseById } from '../api/courseApi';
import { enrollInCourse, getMyEnrollments } from '../api/enrollmentApi';

export default function CourseDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      getCourseById(id),
      user?.role === 'student' ? getMyEnrollments() : Promise.resolve([]),
    ])
      .then(([courseData, enrollments]) => {
        if (cancelled) return;
        setCourse(courseData);
        setEnrolled(enrollments.some((e) => e.course?._id === id));
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load course');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, user?.role]);

  const handleEnroll = async () => {
    setEnrolling(true);
    setError('');
    try {
      await enrollInCourse(id);
      setEnrolled(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <p>Loading course…</p>;
  if (error && !course) return <p className="error">{error}</p>;

  return (
    <section className="dashboard">
      <p><Link to="/">← Back to courses</Link></p>
      <h1>{course.title}</h1>
      <p className="muted">Instructor: {course.instructor?.name}</p>

      <h2>Description</h2>
      <p>{course.description}</p>

      <h2>Content</h2>
      <p>{course.content}</p>

      {error && <p className="error">{error}</p>}

      {user?.role === 'student' && (
        <button onClick={handleEnroll} disabled={enrolling || enrolled}>
          {enrolled ? 'Enrolled' : enrolling ? 'Enrolling…' : 'Enroll'}
        </button>
      )}
    </section>
  );
}
