import { useState } from 'react';
import { gradientFor, photoUrlFor } from '../utils/visuals';

export default function CourseThumbnail({ title, className = '' }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`course-thumb ${className}`} style={{ background: gradientFor(title) }}>
        <span>{title?.[0]?.toUpperCase() || '?'}</span>
      </div>
    );
  }

  return (
    <div className={`course-thumb ${className}`}>
      <img src={photoUrlFor(title)} alt="" loading="lazy" onError={() => setFailed(true)} />
    </div>
  );
}
