import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyCourses, getEnrolledStudents } from '../api/courseApi';
import CourseCard from '../components/CourseCard';
import EmptyState from '../components/EmptyState';

export default function InstructorDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [studentCount, setStudentCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getMyCourses()
      .then(async (data) => {
        if (cancelled) return;
        setCourses(data);
        // Real, not fabricated: sum enrolled students across the instructor's own courses.
        try {
          const perCourse = await Promise.all(data.map((c) => getEnrolledStudents(c._id)));
          if (!cancelled) setStudentCount(perCourse.reduce((sum, list) => sum + list.length, 0));
        } catch {
          if (!cancelled) setStudentCount(null);
        }
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
          <p>Welcome back, {user?.name}.</p>
        </div>
        <Link to="/instructor/courses/new" className="btn-primary">
          + Add New Course
        </Link>
      </div>

      {!loading && (
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-value">{courses.length}</div>
            <div className="stat-label">Courses posted</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{studentCount ?? '—'}</div>
            <div className="stat-label">Total enrolled students</div>
          </div>
        </div>
      )}

      {loading && <p>Loading your courses…</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && courses.length === 0 && (
        <EmptyState
          icon={
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor"
                 strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19a1 1 0 0 1 1 1v14.5a1 1 0 0 1-1 1H6.5A2.5 2.5 0 0 0 4 22V5.5Z M4 17.5A2.5 2.5 0 0 1 6.5 15H20" />
            </svg>
          }
          title="No courses yet"
          text="Create your first course to start teaching students on the platform."
          action={<Link to="/instructor/courses/new" className="btn-primary">+ Add New Course</Link>}
        />
      )}

      {!loading && courses.length > 0 && (
        <div className="course-grid">
          {courses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              footer={<Link to={`/instructor/courses/${course._id}`}>Manage course →</Link>}
            />
          ))}
        </div>
      )}
    </section>
  );
}
