// The only file that talks to the backend.
// The address comes from frontend/.env (VITE_API_URL), never hardcoded.
const API_URL = import.meta.env.VITE_API_URL ?? '';

async function request(path, options = {}) {
  // For FormData (files) the browser sets the Content-Type itself, so we must not.
  const headers = options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' };

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, { headers, ...options });
  } catch {
    throw new Error('Cannot reach the server. Is the backend running?');
  }

  // The backend always answers with JSON, including errors: { "message": "..." }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Request failed.');
  }
  return data;
}

// Files can only be sent as FormData, so name, email, photo and video all go in one.
function toFormData({ name, email, photo, video }) {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('email', email);
  if (photo) formData.append('photo', photo);
  if (video) formData.append('video', video);
  return formData;
}

// Full address of an uploaded photo or video, from the file name saved in the database.
export const mediaUrl = (fileName) => `${API_URL}/uploads/${fileName}`;

export const getUsers = () => request('/api/users');

export const createUser = (user) =>
  request('/api/users', { method: 'POST', body: toFormData(user) });

export const updateUser = (id, user) =>
  request(`/api/users/${id}`, { method: 'PUT', body: toFormData(user) });

export const deleteUser = (id) => request(`/api/users/${id}`, { method: 'DELETE' });
