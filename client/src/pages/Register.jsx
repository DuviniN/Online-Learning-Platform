import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import { PASSWORD_MIN_LENGTH, PASSWORD_PATTERN, PASSWORD_HINT } from '../utils/passwordRules';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', instructorCode: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  // Switching back to student clears any entered code so it's never sent for a student signup.
  const setRole = (role) => setForm({ ...form, role, instructorCode: role === 'student' ? '' : form.instructorCode });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await register(form.name, form.email, form.password, form.role, form.instructorCode);
      setSuccess('Registration successful. Redirecting to login…');
      setTimeout(() => navigate('/login'), 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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

          {form.role === 'instructor' && (
            <>
              <label>Instructor Registration Code</label>
              <div className="input-group">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
                     strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="10.5" width="16" height="10" rx="2" />
                  <path d="M8 10.5V7a4 4 0 1 1 8 0v3.5" />
                  <circle cx="12" cy="15.5" r="1.5" />
                </svg>
                <input
                  type="password"
                  name="instructorCode"
                  value={form.instructorCode}
                  onChange={handleChange}
                  placeholder="Code provided by your institution"
                  required
                  autoComplete="off"
                />
              </div>
            </>
          )}

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
              placeholder="At least 8 characters"
              required
              minLength={PASSWORD_MIN_LENGTH}
              pattern={PASSWORD_PATTERN}
              title={PASSWORD_HINT}
            />
          </div>
          <p className="field-hint">{PASSWORD_HINT}</p>

          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}
          <button type="submit" className="btn-block" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p>Already have an account? <Link to="/login">Login here</Link></p>
      </div>
    </AuthLayout>
  );
}
