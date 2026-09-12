import { Link } from 'react-router-dom';
import { photoUrlFor } from '../utils/visuals';

const FEATURES = [
  {
    title: 'Browse real courses',
    text: 'Explore every course on the platform with full details before you commit.',
    icon: (
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19a1 1 0 0 1 1 1v14.5a1 1 0 0 1-1 1H6.5A2.5 2.5 0 0 0 4 22V5.5Z M4 17.5A2.5 2.5 0 0 1 6.5 15H20" />
    ),
  },
  {
    title: 'Enroll in one click',
    text: 'Join a course instantly and track every enrollment from your own dashboard.',
    icon: <path d="m5 12.5 4.5 4.5L19 7" />,
  },
  {
    title: 'AI course recommendations',
    text: 'Describe a goal like "I want to be a software engineer" and get matched courses.',
    icon: (
      <path d="M12 2.5 13.8 8l5.7.2-4.5 3.6 1.7 5.6L12 14l-4.7 3.4 1.7-5.6-4.5-3.6L10.2 8Z" />
    ),
  },
  {
    title: 'Built for instructors',
    text: 'Create courses, edit content, and see who has enrolled in a simple table.',
    icon: <path d="M3 20V10l9-6 9 6v10 M8 20v-6h8v6 M3 10l9 5 9-5" />,
  },
];

export default function LandingPage() {
  return (
    <div className="landing">
      <section className="hero-band full-bleed">
        <div className="hero-glow hero-glow-1" />
        <div className="hero-glow hero-glow-2" />
        <div className="section-inner hero-split">
          <div className="hero-copy">
            <span className="eyebrow">Online Learning Platform</span>
            <h1>Learn new skills.<br />Teach what you know.</h1>
            <p className="hero-sub">
              Browse courses, enroll in a click, and get AI-powered recommendations tailored
              to your goals — or create and manage your own courses as an instructor.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn-primary btn-lg">Get Started — it's free</Link>
              <Link to="/login" className="btn-outline btn-lg">Log In</Link>
            </div>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="hero-card hero-card-1">
              <div className="hero-card-thumb">
                <img src={photoUrlFor('coding', 300, 160)} alt="" loading="lazy" />
              </div>
              <div className="hero-card-line w-80" />
              <div className="hero-card-line w-50" />
              <div className="hero-card-foot">
                <span className="hero-card-dot" />
                <div className="hero-card-line w-40" style={{ marginBottom: 0 }} />
              </div>
            </div>
            <div className="hero-card hero-card-2">
              <div className="hero-card-thumb">
                <img src={photoUrlFor('graduation', 300, 160)} alt="" loading="lazy" />
              </div>
              <div className="hero-card-line w-80" />
              <div className="hero-card-line w-60" />
            </div>
            <div className="hero-card hero-card-3">
              <div className="hero-card-thumb">
                <img src={photoUrlFor('teamwork', 300, 160)} alt="" loading="lazy" />
              </div>
              <div className="hero-card-line w-70" />
              <div className="hero-card-line w-40" />
            </div>
          </div>
        </div>
      </section>

      <section className="feature-band full-bleed">
        <div className="section-inner">
          <div className="feature-grid">
            {FEATURES.map((f) => (
              <div className="feature-card" key={f.title}>
                <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  {f.icon}
                </svg>
                <h2>{f.title}</h2>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="steps-band full-bleed">
        <div className="section-inner">
          <span className="section-eyebrow">Getting started</span>
          <h2 className="steps-title">How it works</h2>
          <div className="steps-grid">
            <div className="steps-col">
              <span className="steps-label">For students</span>
              <ol>
                <li>Create a free account as a student.</li>
                <li>Browse the catalog or ask the AI advisor for recommendations.</li>
                <li>Enroll and track your courses from "My Enrollments".</li>
              </ol>
            </div>
            <div className="steps-col">
              <span className="steps-label">For instructors</span>
              <ol>
                <li>Sign up as an instructor.</li>
                <li>Create a course with a title, description, and content.</li>
                <li>Manage your courses and see enrolled students anytime.</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-band full-bleed">
        <div className="section-inner cta-inner">
          <h2>Ready to jump in?</h2>
          <p>Create your account in under a minute.</p>
          <Link to="/register" className="btn-cta">Create your account</Link>
        </div>
      </section>
    </div>
  );
}
