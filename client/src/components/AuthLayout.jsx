import { Link } from 'react-router-dom';

// A person studying at a desk with an open book and laptop — verified by eye
// (see utils/visuals.js), used here at a taller crop for the auth side panel.
const AUTH_PHOTO =
  'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=900&h=1300&fit=crop&q=80&auto=format';

const BENEFITS = [
  'Browse and enroll in courses instantly',
  'Get AI-powered course recommendations',
  'Create and manage your own courses as an instructor',
];

export default function AuthLayout({ children }) {
  return (
    <div className="auth-shell full-bleed">
      <div className="auth-photo-panel" style={{ backgroundImage: `url('${AUTH_PHOTO}')` }}>
        <div className="auth-photo-overlay" />

        <Link to="/" className="auth-brand">
          <span className="auth-brand-mark" />
          Online Learning Platform
        </Link>

        <div className="auth-photo-copy">
          <h2>Learn something new.<br />Teach what you know.</h2>
          <p>One platform for students and instructors alike.</p>
          <ul className="auth-benefits">
            {BENEFITS.map((b) => (
              <li key={b}>
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor"
                     strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m5 12.5 4.5 4.5L19 7" />
                </svg>
                {b}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="auth-form-side">
        {children}
      </div>
    </div>
  );
}
