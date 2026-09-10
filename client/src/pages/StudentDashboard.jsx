import { useAuth } from '../context/AuthContext';

export default function StudentDashboard() {
  const { user } = useAuth();

  return (
    <section className="dashboard">
      <h1>Student Dashboard</h1>
      <p>Welcome, {user?.name}.</p>
    </section>
  );
}
