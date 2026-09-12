import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCourseById } from '../api/courseApi';
import { enrollInCourse, getMyEnrollments } from '../api/enrollmentApi';
import Avatar from '../components/Avatar';
import { photoUrlFor, timeAgo } from '../utils/visuals';

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
    <section className="course-detail">
      <p><Link to="/">← Back to courses</Link></p>

      <div
        className="course-detail-banner"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.35), rgba(15, 23, 42, 0.65)), url('${photoUrlFor(course.title, 1200, 400)}')`,
        }}
      >
        <span className="eyebrow eyebrow-on-dark">Course</span>
        <h1>{course.title}</h1>
        {course.instructor?.name && (
          <p className="on-dark">
            Taught by <strong>{course.instructor.name}</strong>
            {course.createdAt && ` · Posted ${timeAgo(course.createdAt)}`}
          </p>
        )}
      </div>

      <div className="course-detail-layout">
        <div className="course-detail-main">
          <section>
            <h2>Description</h2>
            <p>{course.description}</p>
          </section>
          <section>
            <h2>What you'll learn</h2>
            <p>{course.content}</p>
          </section>
        </div>

        <aside className="sidebar-card">
          {course.instructor?.name && (
            <div className="sidebar-instructor">
              <Avatar name={course.instructor.name} size={40} />
              <div>
                <div className="sidebar-instructor-name">{course.instructor.name}</div>
                <div className="muted">Instructor</div>
              </div>
            </div>
          )}

          <span className="badge-free badge-free-lg">Free enrollment</span>

          {error && <p className="error">{error}</p>}

          {user?.role === 'student' ? (
            <button onClick={handleEnroll} disabled={enrolling || enrolled} className="btn-block">
              {enrolled ? 'Enrolled ✓' : enrolling ? 'Enrolling…' : 'Enroll now'}
            </button>
          ) : !user ? (
            <Link to="/login" className="btn-primary btn-block">Log in to enroll</Link>
          ) : null}

          {course.createdAt && (
            <p className="muted sidebar-note">Posted {timeAgo(course.createdAt)}</p>
          )}
        </aside>
      </div>
    </section>
  );
}
