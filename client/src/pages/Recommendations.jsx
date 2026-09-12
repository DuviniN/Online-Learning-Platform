import { useState } from 'react';
import { getRecommendations } from '../api/recommendationApi';
import CourseCard from '../components/CourseCard';

const EXAMPLE_PROMPTS = [
  'I want to be a software engineer',
  'I want to switch into data science',
  'I want to become a better manager',
];

export default function Recommendations() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await getRecommendations(prompt);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="recommend-page">
      <div className="recommend-hero">
        <span className="eyebrow">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path d="M12 2.5 13.8 8l5.7.2-4.5 3.6 1.7 5.6L12 14l-4.7 3.4 1.7-5.6-4.5-3.6L10.2 8Z" />
          </svg>
          AI-Powered
        </span>
        <h1>Find your next course</h1>
        <p className="muted">
          Describe your goal and we'll match you with real courses from the catalog.
        </p>
      </div>

      <div className="form-page recommend-card">
        <form onSubmit={handleSubmit}>
          <div className="prompt-input">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
                 strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3 13.8 8.2 19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8Z" />
              <path d="M19 15.5 19.8 17.7 22 18.5l-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8Z" />
            </svg>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder='e.g. "I want to be a software engineer, what courses should I follow?"'
              aria-label="Describe your learning goal"
              required
            />
          </div>

          <div className="prompt-chips">
            {EXAMPLE_PROMPTS.map((p) => (
              <button type="button" key={p} className="chip" onClick={() => setPrompt(p)}>
                {p}
              </button>
            ))}
          </div>

          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn-block" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" /> Thinking…
              </>
            ) : (
              'Get Recommendations'
            )}
          </button>
        </form>
      </div>

      {result && (
        <div className="recommend-results">
          {result.advice && (
            <div className="ai-advice">
              <span className="ai-avatar">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M12 2.5 13.8 8l5.7.2-4.5 3.6 1.7 5.6L12 14l-4.7 3.4 1.7-5.6-4.5-3.6L10.2 8Z" />
                </svg>
              </span>
              <p>{result.advice}</p>
            </div>
          )}

          {result.recommendations.length > 0 ? (
            <>
              <h2 className="recommend-results-title">Recommended for you</h2>
              <div className="course-grid">
                {result.recommendations.map((c) => (
                  <CourseCard key={c._id} course={c} />
                ))}
              </div>
            </>
          ) : (
            <p className="muted">No matching courses were found for this goal yet.</p>
          )}
        </div>
      )}
    </section>
  );
}
