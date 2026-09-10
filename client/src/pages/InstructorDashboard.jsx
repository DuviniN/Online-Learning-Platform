import { useAuth } from '../context/AuthContext';

export default function InstructorDashboard() {
  const { user } = useAuth();

  return (
    <section className="dashboard">
      <h1>Instructor Dashboard</h1>
      <p>Welcome, {user?.name}.</p>
    </section>
  );
}
