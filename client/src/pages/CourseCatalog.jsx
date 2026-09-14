import { useEffect, useState } from 'react';
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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [enrollingId, setEnrollingId] = useState(null);
  const [enrolledIds, setEnrolledIds] = useState(new Set());

  // Keep the search box in sync when the navbar search (or a shared link) sets ?q=
  useEffect(() => {
    setQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const handleQueryChange = (value) => {
    setQuery(value);
    setSearchParams(value ? { q: value } : {}, { replace: true });
  };

  // Debounce so every keystroke doesn't fire a request.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 350);
    return () => clearTimeout(t);
  }, [query]);

  // Fetch page 1 whenever the (debounced) search term changes.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    getAllCourses({ page: 1, limit: PAGE_SIZE, search: debouncedQuery })
      .then((data) => {
        if (cancelled) return;
        setCourses(data.courses);
        setPage(data.page);
        setTotalPages(data.totalPages);
        setTotalCount(data.totalCount);
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
  }, [debouncedQuery]);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    setError('');
    try {
      const data = await getAllCourses({ page: page + 1, limit: PAGE_SIZE, search: debouncedQuery });
      setCourses((prev) => [...prev, ...data.courses]);
      setPage(data.page);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load more courses');
    } finally {
      setLoadingMore(false);
    }
  };

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

  const hasMore = page < totalPages;

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

      {!loading && courses.length === 0 && (
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
        {courses.map((course) => (
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
          <button className="btn-outline" onClick={handleLoadMore} disabled={loadingMore}>
            {loadingMore ? 'Loading…' : 'Load More Courses'}
          </button>
          <p className="muted">
            Showing {courses.length} of {totalCount} courses
          </p>
        </div>
      )}
    </section>
  );
}
