import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { usersApi } from '../api/usersApi';
import { authApi } from '../api/authApi';
import { getErrorMessage } from '../api/axios';
import ErrorMessage from '../components/ErrorMessage.jsx';

export default function Profile() {
  const { user, updateLocalUser } = useAuth();
  const [name, setName] = useState(user.name);
  const [savingName, setSavingName] = useState(false);
  const [nameMessage, setNameMessage] = useState('');
  const [nameError, setNameError] = useState('');

  const [imageError, setImageError] = useState('');
  const [uploading, setUploading] = useState(false);

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const handleNameSubmit = async (e) => {
    e.preventDefault();
    setSavingName(true);
    setNameError('');
    setNameMessage('');
    try {
      const res = await usersApi.update(user.id, { name });
      updateLocalUser({ name: res.data.name });
      setNameMessage('Name updated.');
    } catch (err) {
      setNameError(getErrorMessage(err));
    } finally {
      setSavingName(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setImageError('');
    try {
      const res = await usersApi.uploadProfileImage(user.id, file);
      updateLocalUser({ profileImage: res.data.profileImage });
    } catch (err) {
      setImageError(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSavingPassword(true);
    setPasswordError('');
    setPasswordMessage('');
    try {
      await authApi.changePassword(passwordForm);
      setPasswordMessage('Password updated.');
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setPasswordError(getErrorMessage(err));
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h1 className="font-display text-2xl text-ink">Profile</h1>
        <p className="text-sm text-ink/50">Manage your personal information.</p>
      </div>

      <div className="card space-y-4 p-6">
        <h2 className="font-medium text-ink">Profile photo</h2>
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-brand-100 text-xl font-semibold text-brand-700">
            {user.profileImage ? (
              <img
                src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${user.profileImage}`}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              user.name?.[0]?.toUpperCase()
            )}
          </span>
          <label className="btn-secondary cursor-pointer">
            {uploading ? 'Uploading…' : 'Change photo'}
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>
        </div>
        <ErrorMessage message={imageError} />
      </div>

      <form onSubmit={handleNameSubmit} className="card space-y-4 p-6">
        <h2 className="font-medium text-ink">Name</h2>
        <ErrorMessage message={nameError} />
        {nameMessage && <p className="text-sm text-signal-moss">{nameMessage}</p>}
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="btn-primary" disabled={savingName}>
          {savingName ? 'Saving…' : 'Save name'}
        </button>
      </form>

      <form onSubmit={handlePasswordSubmit} className="card space-y-4 p-6">
        <h2 className="font-medium text-ink">Change password</h2>
        <ErrorMessage message={passwordError} />
        {passwordMessage && <p className="text-sm text-signal-moss">{passwordMessage}</p>}
        <div>
          <label className="label">Current password</label>
          <input
            type="password"
            required
            className="input"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
          />
        </div>
        <div>
          <label className="label">New password</label>
          <input
            type="password"
            required
            minLength={6}
            className="input"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
          />
        </div>
        <button className="btn-primary" disabled={savingPassword}>
          {savingPassword ? 'Saving…' : 'Update password'}
        </button>
      </form>
    </div>
  );
}
