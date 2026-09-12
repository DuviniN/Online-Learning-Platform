import { Link } from 'react-router-dom';
import CourseThumbnail from './CourseThumbnail';
import Avatar from './Avatar';
import { timeAgo } from '../utils/visuals';

// Reusable course card used by the catalog, recommendations, enrollments and
// instructor dashboard. `footer` lets each page slot in its own action
// (Enroll button, "Manage course" link, etc.) without duplicating the card.
export default function CourseCard({ course, footer }) {
  const instructorName = typeof course.instructor === 'object' ? course.instructor?.name : null;

  return (
    <div className="course-card">
      <Link to={`/courses/${course._id}`} className="course-thumb-link">
        <CourseThumbnail title={course.title} />
      </Link>
      <div className="course-card-body">
        <h2><Link to={`/courses/${course._id}`}>{course.title}</Link></h2>
        {course.description && <p className="course-card-desc">{course.description}</p>}

        {(instructorName || course.createdAt) && (
          <div className="course-card-meta">
            {instructorName && (
              <span className="course-card-instructor">
                <Avatar name={instructorName} size={20} />
                {instructorName}
              </span>
            )}
            {course.createdAt && <span className="muted">{timeAgo(course.createdAt)}</span>}
          </div>
        )}

        <div className="course-card-footer">
          <span className="badge-free">Free</span>
          {footer}
        </div>
      </div>
    </div>
  );
}
