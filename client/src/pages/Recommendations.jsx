import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getRecommendations } from '../api/recommendationApi';

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
    <section className="dashboard">
      <h1>Get Course Recommendations</h1>
      <p className="muted">
        Tell us your goal — e.g. "I want to be a software engineer, what courses should I follow?"
      </p>

      <div className="form-page">
        <form onSubmit={handleSubmit}>
          <label>Your goal</label>
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="I want to be a software engineer, what courses should I follow?"
            required
          />
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Thinking…' : 'Get Recommendations'}
          </button>
        </form>
      </div>

      {result && (
        <div className="table-section">
          {result.advice && <p>{result.advice}</p>}

          {result.recommendations.length > 0 ? (
            <div className="card-grid">
              {result.recommendations.map((c) => (
                <div className="card" key={c._id}>
                  <h2><Link to={`/courses/${c._id}`}>{c.title}</Link></h2>
                  <p>{c.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted">No matching courses were found for this goal yet.</p>
          )}
        </div>
      )}
    </section>
  );
}
