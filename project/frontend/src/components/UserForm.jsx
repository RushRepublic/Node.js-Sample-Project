import { useState, useEffect, useRef } from 'react';
import { mediaUrl } from '../api/usersApi.js';

// Must match the limits in backend/middleware/upload.js
const MAX_PHOTO_MB = 5;
const MAX_VIDEO_MB = 50;

// Used for both adding and editing.
// editingUser = null  -> "Add" mode
// editingUser = {...} -> "Edit" mode, fields are pre-filled
// onSubmit must return a promise that resolves to true when saving worked.
export default function UserForm({ editingUser, onSubmit, onCancel }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [photo, setPhoto] = useState(null); // File chosen by the user, or null
  const [video, setVideo] = useState(null);
  const [fileError, setFileError] = useState('');
  const [saving, setSaving] = useState(false);

  // File inputs cannot be cleared through state, so we keep a reference to empty them.
  const photoInput = useRef(null);
  const videoInput = useRef(null);

  function clearFiles() {
    setPhoto(null);
    setVideo(null);
    setFileError('');
    if (photoInput.current) photoInput.current.value = '';
    if (videoInput.current) videoInput.current.value = '';
  }

  // Fill the fields when the user clicks "Edit", clear them otherwise.
  useEffect(() => {
    setName(editingUser ? editingUser.name : '');
    setEmail(editingUser ? editingUser.email : '');
    clearFiles();
  }, [editingUser]);

  // Check the file size in the browser so the user gets instant feedback.
  function handleFileChange(event, kind) {
    const file = event.target.files[0] || null;
    const maxMb = kind === 'photo' ? MAX_PHOTO_MB : MAX_VIDEO_MB;

    if (file && file.size > maxMb * 1024 * 1024) {
      setFileError(`The ${kind} is too large. Maximum is ${maxMb} MB.`);
      event.target.value = '';
      return;
    }
    setFileError('');
    if (kind === 'photo') setPhoto(file);
    else setVideo(file);
  }

  async function handleSubmit(event) {
    event.preventDefault(); // stop the browser from reloading the page
    setSaving(true);
    const success = await onSubmit({ name, email, photo, video });
    setSaving(false);
    if (success) {
      setName('');
      setEmail('');
      clearFiles();
    }
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h2>{editingUser ? 'Edit user' : 'Add user'}</h2>

      <label>
        Name
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          required
        />
      </label>

      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          maxLength={255}
          required
        />
      </label>

      <label>
        Photo (JPG, PNG, WEBP or GIF, max {MAX_PHOTO_MB} MB)
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          ref={photoInput}
          onChange={(e) => handleFileChange(e, 'photo')}
        />
      </label>
      {editingUser && editingUser.photo && !photo && (
        <div className="current-media">
          <img src={mediaUrl(editingUser.photo)} alt="Current photo" className="thumb" />
          <span>Current photo. Choose a new file to replace it.</span>
        </div>
      )}

      <label>
        Video (MP4, WEBM or MOV, max {MAX_VIDEO_MB} MB)
        <input
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          ref={videoInput}
          onChange={(e) => handleFileChange(e, 'video')}
        />
      </label>
      {editingUser && editingUser.video && !video && (
        <div className="current-media">
          <video src={mediaUrl(editingUser.video)} className="thumb-video" preload="metadata" muted />
          <span>Current video. Choose a new file to replace it.</span>
        </div>
      )}

      {fileError && <p className="field-error">{fileError}</p>}

      <div className="form-buttons">
        <button type="submit" className="btn primary" disabled={saving}>
          {saving ? 'Saving...' : editingUser ? 'Update user' : 'Add user'}
        </button>
        {editingUser && (
          <button type="button" className="btn" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
