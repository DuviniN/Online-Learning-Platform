export default function AuthLayout({ children }) {
  return (
    <div className="auth-shell">
      <div className="auth-illustration">
        <svg viewBox="0 0 420 420" className="auth-illustration-svg" aria-hidden="true">
          <circle cx="210" cy="210" r="170" fill="var(--accent-bg)" />

          {/* floating doodles */}
          <circle cx="70" cy="90" r="10" fill="none" stroke="var(--accent-border)" strokeWidth="3" />
          <rect x="330" y="70" width="18" height="18" rx="3" fill="none" stroke="var(--accent-border)"
                strokeWidth="3" transform="rotate(20 339 79)" />
          <path d="M55 300 l12 20 h-24 z" fill="none" stroke="var(--accent-border)" strokeWidth="3" strokeLinejoin="round" />
          <circle cx="360" cy="250" r="6" fill="#fbbf24" />

          {/* open book */}
          <g transform="translate(210 250)">
            <path d="M0 -18 C-46 -34 -92 -30 -92 -14 V26 C-92 10 -46 6 0 22 Z" fill="#ffffff" stroke="var(--accent)" strokeWidth="4" strokeLinejoin="round" />
            <path d="M0 -18 C46 -34 92 -30 92 -14 V26 C92 10 46 6 0 22 Z" fill="#ffffff" stroke="var(--accent)" strokeWidth="4" strokeLinejoin="round" />
            <path d="M-70 -10 C-50 -18 -25 -18 -8 -10" fill="none" stroke="var(--accent-border)" strokeWidth="3" strokeLinecap="round" />
            <path d="M-70 2 C-50 -6 -25 -6 -8 2" fill="none" stroke="var(--accent-border)" strokeWidth="3" strokeLinecap="round" />
            <path d="M70 -10 C50 -18 25 -18 8 -10" fill="none" stroke="var(--accent-border)" strokeWidth="3" strokeLinecap="round" />
            <path d="M70 2 C50 -6 25 -6 8 2" fill="none" stroke="var(--accent-border)" strokeWidth="3" strokeLinecap="round" />
          </g>

          {/* graduation cap */}
          <g transform="translate(210 118)">
            <path d="M-58 0 0 -24 58 0 0 24 Z" fill="var(--text-h)" />
            <rect x="-10" y="20" width="20" height="26" rx="4" fill="var(--accent)" />
            <path d="M40 6 V34 C40 42 22 48 0 48 C-22 48 -40 42 -40 34 V6" fill="none" stroke="var(--text-h)" strokeWidth="4" />
            <circle cx="52" cy="10" r="5" fill="#fbbf24" />
            <path d="M52 10 V38" stroke="var(--text-h)" strokeWidth="3" />
          </g>

          {/* lightbulb */}
          <g transform="translate(102 250)">
            <circle cx="0" cy="0" r="26" fill="#fff" stroke="var(--accent)" strokeWidth="4" />
            <path d="M-9 10 H9 M-7 16 H7" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" />
            <path d="M-9 -6 C-9 -16 9 -16 9 -6 C9 0 3 2 3 10 h-6 c0 -8 -6 -10 -6 -16 Z" fill="var(--accent-bg)" stroke="var(--accent)" strokeWidth="2.5" />
            <path d="M0 -34 V-24 M-20 -22 l7 7 M20 -22 l-7 7" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" />
          </g>
        </svg>
      </div>

      <div className="auth-form-side">
        {children}
      </div>
    </div>
  );
}
