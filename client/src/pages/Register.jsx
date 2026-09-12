import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const setRole = (role) => setForm({ ...form, role });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="form-page">
        <h1>Create your account</h1>
        <p className="muted">Join as a student or an instructor.</p>
        <form onSubmit={handleSubmit}>
          <label>I am a</label>
          <div className="role-toggle">
            <button
              type="button"
              className={form.role === 'student' ? 'active' : ''}
              onClick={() => setRole('student')}
            >
              🎓 Student
            </button>
            <button
              type="button"
              className={form.role === 'instructor' ? 'active' : ''}
              onClick={() => setRole('instructor')}
            >
              🧑‍🏫 Instructor
            </button>
          </div>

          <label>Name</label>
          <div className="input-group">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
                 strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="3.5" />
              <path d="M5 20c1.2-3.5 4.1-5.5 7-5.5s5.8 2 7 5.5" />
            </svg>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Jane Doe" required />
          </div>

          <label>Email</label>
          <div className="input-group">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
                 strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3.5 6.5 8.5 6 8.5-6" />
            </svg>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </div>

          <label>Password</label>
          <div className="input-group">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
                 strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="10.5" width="16" height="10" rx="2" />
              <path d="M8 10.5V7a4 4 0 1 1 8 0v3.5" />
            </svg>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              required
              minLength={6}
            />
          </div>

          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn-block" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p>Already have an account? <Link to="/login">Login here</Link></p>
      </div>
    </AuthLayout>
  );
}
