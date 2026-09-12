import { initialsFor } from '../utils/visuals';

export default function Avatar({ name, size = 22 }) {
  return (
    <span
      className="avatar"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}
    >
      {initialsFor(name)}
    </span>
  );
}
