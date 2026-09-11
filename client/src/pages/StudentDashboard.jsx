import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function StudentDashboard() {
  const { user } = useAuth();

  return (
    <section className="dashboard">
      <h1>Student Dashboard</h1>
      <p>Welcome, {user?.name}.</p>
      <p>
        <Link to="/">Browse courses</Link> · <Link to="/my-enrollments">View my enrollments</Link>
      </p>
    </section>
  );
}
