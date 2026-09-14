import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMe, updateMe } from '../api/userApi';
import { getMyEnrollments } from '../api/enrollmentApi';
import { getMyCourses, getEnrolledStudents } from '../api/courseApi';
import Avatar from '../components/Avatar';
import { PASSWORD_MIN_LENGTH, PASSWORD_PATTERN, PASSWORD_HINT } from '../utils/passwordRules';

const MailIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3.5 6.5 8.5 6 8.5-6" />
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20c1.2-3.5 4.1-5.5 7-5.5s5.8 2 7 5.5" />
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="10.5" width="16" height="10" rx="2" />
    <path d="M8 10.5V7a4 4 0 1 1 8 0v3.5" />
  </svg>
);

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(user);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  const [name, setName] = useState(user?.name || '');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getMe()
      .then((data) => {
        if (cancelled) return;
        setProfile(data);
        setName(data.name);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    const statsPromise =
      user?.role === 'instructor'
        ? getMyCourses().then(async (courses) => {
            const perCourse = await Promise.all(courses.map((c) => getEnrolledStudents(c._id)));
            return {
              primaryLabel: 'Courses posted',
              primaryValue: courses.length,
              secondaryLabel: 'Total enrolled students',
              secondaryValue: perCourse.reduce((sum, list) => sum + list.length, 0),
            };
          })
        : getMyEnrollments().then((enrollments) => ({
            primaryLabel: 'Enrolled courses',
            primaryValue: enrollments.length,
            secondaryLabel: null,
            secondaryValue: null,
          }));

    statsPromise.then((s) => {
      if (!cancelled) setStats(s);
    });

    return () => {
      cancelled = true;
    };
  }, [user?.role]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setSavingProfile(true);
    try {
      const data = await updateMe({ name });
      setProfile((p) => ({ ...p, name: data.name }));
      updateUser({ name: data.name });
      setProfileSuccess('Profile updated successfully.');
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    setSavingPassword(true);
    try {
      await updateMe({ currentPassword, newPassword });
      setPasswordSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) return <p>Loading profile…</p>;

  return (
    <section className="dashboard">
      <div className="profile-banner">
        <div className="profile-banner-glow" />
        <div className="profile-header">
          <Avatar name={profile?.name} size={84} className="profile-avatar-ring" />
          <div>
            <h1>{profile?.name}</h1>
            <span className={`role-badge role-badge-${profile?.role}`}>
              {profile?.role === 'instructor' ? '🧑‍🏫 Instructor' : '🎓 Student'}
            </span>
            <p className="muted">{profile?.email}</p>
            {profile?.createdAt && (
              <p className="muted">
                Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>
        </div>
      </div>

      {stats && (
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.primaryValue}</div>
            <div className="stat-label">{stats.primaryLabel}</div>
          </div>
          {stats.secondaryLabel && (
            <div className="stat-card">
              <div className="stat-value">{stats.secondaryValue}</div>
              <div className="stat-label">{stats.secondaryLabel}</div>
            </div>
          )}
        </div>
      )}

      <div className="profile-grid">
        <div className="form-page">
          <div className="form-section-title">
            <span className="form-section-icon"><UserIcon /></span>
            <h2>Edit Profile</h2>
          </div>
          <form onSubmit={handleProfileSubmit}>
            <label>Full Name</label>
            <div className="input-group">
              <UserIcon />
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <label>Email</label>
            <div className="input-group">
              <MailIcon />
              <input value={profile?.email || ''} disabled />
            </div>

            {profileError && <p className="error">{profileError}</p>}
            {profileSuccess && <p className="success">{profileSuccess}</p>}
            <button type="submit" disabled={savingProfile}>
              {savingProfile ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>

        <div className="form-page">
          <div className="form-section-title">
            <span className="form-section-icon form-section-icon-danger"><LockIcon /></span>
            <h2>Change Password</h2>
          </div>
          <form onSubmit={handlePasswordSubmit}>
            <label>Current Password</label>
            <div className="input-group">
              <LockIcon />
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <label>New Password</label>
            <div className="input-group">
              <LockIcon />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={PASSWORD_MIN_LENGTH}
                pattern={PASSWORD_PATTERN}
                title={PASSWORD_HINT}
              />
            </div>
            <p className="field-hint">{PASSWORD_HINT}</p>

            <label>Confirm New Password</label>
            <div className="input-group">
              <LockIcon />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={PASSWORD_MIN_LENGTH}
              />
            </div>

            {passwordError && <p className="error">{passwordError}</p>}
            {passwordSuccess && <p className="success">{passwordSuccess}</p>}
            <button type="submit" disabled={savingPassword}>
              {savingPassword ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
