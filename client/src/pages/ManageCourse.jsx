import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCourseById, updateCourse, getEnrolledStudents } from '../api/courseApi';

export default function ManageCourse() {
  const { id } = useParams();
  const [form, setForm] = useState({ title: '', description: '', content: '' });
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([getCourseById(id), getEnrolledStudents(id)])
      .then(([course, enrolledStudents]) => {
        if (cancelled) return;
        setForm({ title: course.title, description: course.description, content: course.content });
        setStudents(enrolledStudents);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load course');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaveMessage('');
    setSaving(true);
    try {
      await updateCourse(id, form);
      setSaveMessage('Course updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update course');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading course…</p>;
  if (error && !form.title) return <p className="error">{error}</p>;

  return (
    <section className="dashboard">
      <h1>Manage Course</h1>
      <p><Link to="/instructor/dashboard">← Back to dashboard</Link></p>

      <div className="form-page">
        <h2>Course Details</h2>
        <form onSubmit={handleSubmit}>
          <label>Title</label>
          <input name="title" value={form.title} onChange={handleChange} required />

          <label>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} required rows={3} />

          <label>Content</label>
          <textarea name="content" value={form.content} onChange={handleChange} required rows={6} />

          {error && <p className="error">{error}</p>}
          {saveMessage && <p className="success">{saveMessage}</p>}
          <button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>

      <div className="table-section">
        <h2>Enrolled Students ({students.length})</h2>
        {students.length === 0 ? (
          <p>No students have enrolled in this course yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Enrolled On</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id}>
                  <td>{s.name}</td>
                  <td>{s.email}</td>
                  <td>{new Date(s.enrolledAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
