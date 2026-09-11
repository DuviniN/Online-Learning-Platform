import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createCourse } from '../api/courseApi';

export default function CreateCourse() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', content: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const course = await createCourse(form);
      navigate(`/instructor/courses/${course._id}`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create course');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="form-page">
      <h1>Add New Course</h1>
      <form onSubmit={handleSubmit}>
        <label>Title</label>
        <input name="title" value={form.title} onChange={handleChange} required />

        <label>Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} required rows={3} />

        <label>Content</label>
        <textarea name="content" value={form.content} onChange={handleChange} required rows={6} />

        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={saving}>
          {saving ? 'Creating…' : 'Create Course'}
        </button>
      </form>
      <p><Link to="/instructor/dashboard">← Back to dashboard</Link></p>
    </div>
  );
}
