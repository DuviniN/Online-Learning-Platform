import { initialsFor } from '../utils/visuals';

export default function Avatar({ name, size = 22, className = '' }) {
  return (
    <span
      className={`avatar ${className}`.trim()}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}
    >
      {initialsFor(name)}
    </span>
  );
}
