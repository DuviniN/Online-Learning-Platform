import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createCourse } from '../api/courseApi';
import { useAuth } from '../context/AuthContext';
import CourseCard from '../components/CourseCard';

export default function CreateCourse() {
  const navigate = useNavigate();
  const { user } = useAuth();
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

  const previewCourse = {
    _id: 'preview',
    title: form.title || 'Your course title',
    description: form.description || 'A short, compelling description of what students will learn appears here.',
    instructor: { name: user?.name || 'You' },
    createdAt: new Date().toISOString(),
  };

  return (
    <section className="dashboard">
      <div className="dashboard-header">
        <div>
          <span className="eyebrow">Instructor Tools</span>
          <h1>Add New Course</h1>
          <p className="muted">Fill in the details below — students will see exactly this on the catalog.</p>
        </div>
      </div>

      <div className="create-course-layout">
        <div className="form-page create-course-form">
          <form onSubmit={handleSubmit}>
            <label>Title</label>
            <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Complete React Developer Course" required />
            <p className="field-hint">A clear, specific title helps students find your course.</p>

            <label>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="A short summary of what this course covers and who it's for"
              required
              rows={3}
            />
            <p className="field-hint">Shown on the catalog card — keep it to one or two sentences.</p>

            <label>Content</label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              placeholder={'One learning point per line, e.g.\nComponents and props\nState and hooks\nRouting between pages'}
              required
              rows={6}
            />
            <p className="field-hint">Each line becomes a bullet point on the course detail page.</p>

            {error && <p className="error">{error}</p>}
            <button type="submit" disabled={saving}>{saving ? 'Creating…' : 'Create Course'}</button>
          </form>
          <p><Link to="/instructor/dashboard">← Back to dashboard</Link></p>
        </div>

        <div className="create-course-preview">
          <p className="preview-label">Live Preview</p>
          <div className="preview-wrapper">
            <span className="preview-ribbon">Preview</span>
            <CourseCard course={previewCourse} />
          </div>

          <div className="tips-card">
            <h3>Tips for a great listing</h3>
            <ul>
              <li>Lead with the outcome — what will students be able to do?</li>
              <li>Keep the description under 2 sentences; save detail for the content list.</li>
              <li>List content points in the order students will learn them.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
