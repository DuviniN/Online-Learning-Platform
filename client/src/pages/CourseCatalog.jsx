import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllCourses } from '../api/courseApi';
import { enrollInCourse } from '../api/enrollmentApi';
import CourseCard from '../components/CourseCard';
import EmptyState from '../components/EmptyState';

const PAGE_SIZE = 9;

export default function CourseCatalog() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [enrollingId, setEnrollingId] = useState(null);
  const [enrolledIds, setEnrolledIds] = useState(new Set());

  // Keep the search box in sync when the navbar search (or a shared link) sets ?q=
  useEffect(() => {
    setQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const handleQueryChange = (value) => {
    setQuery(value);
    setVisibleCount(PAGE_SIZE);
    setSearchParams(value ? { q: value } : {}, { replace: true });
  };

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

  const filteredCourses = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter((c) =>
      [c.title, c.description, c.instructor?.name].some((field) =>
        field?.toLowerCase().includes(q)
      )
    );
  }, [courses, query]);

  const visibleCourses = filteredCourses.slice(0, visibleCount);
  const hasMore = visibleCount < filteredCourses.length;

  return (
    <section className="dashboard">
      <h1>Explore Courses</h1>
      <p className="muted">Browse everything currently available on the platform.</p>

      <div className="search-bar">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="search"
          placeholder="Search by title, topic, or instructor…"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
        />
      </div>

      {loading && <p>Loading courses…</p>}
      {error && <p className="error">{error}</p>}

      {!loading && filteredCourses.length === 0 && (
        <EmptyState
          icon={
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor"
                 strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          }
          title={query ? 'No matching courses' : 'No courses yet'}
          text={
            query
              ? `Nothing matched "${query}". Try a different search term.`
              : 'Check back soon — instructors are still adding courses.'
          }
        />
      )}

      <div className="course-grid">
        {visibleCourses.map((course) => (
          <CourseCard
            key={course._id}
            course={course}
            footer={
              user?.role === 'student' ? (
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
              ) : (
                <Link to={`/courses/${course._id}`}>View details →</Link>
              )
            }
          />
        ))}
      </div>

      {hasMore && (
        <div className="load-more">
          <button className="btn-outline" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
            Load More Courses
          </button>
          <p className="muted">
            Showing {visibleCourses.length} of {filteredCourses.length} courses
          </p>
        </div>
      )}
    </section>
  );
}
