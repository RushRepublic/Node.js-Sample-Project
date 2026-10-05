import { useState, useEffect } from 'react';
import * as usersApi from '../api/usersApi.js';
import UserForm from '../components/UserForm.jsx';
import UserTable from '../components/UserTable.jsx';
import Message from '../components/Message.jsx';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');     // red message
  const [success, setSuccess] = useState(''); // green message
  const [editingUser, setEditingUser] = useState(null);

  async function loadUsers() {
    try {
      setUsers(await usersApi.getUsers());
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Runs once when the page opens.
  useEffect(() => {
    loadUsers();
  }, []);

  // Called by the form for both "add" and "edit". Returns true if it worked.
  async function handleSave(userData) {
    setError('');
    setSuccess('');
    try {
      if (editingUser) {
        await usersApi.updateUser(editingUser.id, userData);
        setSuccess('User updated.');
        setEditingUser(null);
      } else {
        await usersApi.createUser(userData);
        setSuccess('User added.');
      }
      await loadUsers();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }

  async function handleDelete(user) {
    if (!window.confirm(`Delete ${user.name}?`)) return;
    setError('');
    setSuccess('');
    try {
      await usersApi.deleteUser(user.id);
      setSuccess('User deleted.');
      if (editingUser && editingUser.id === user.id) setEditingUser(null);
      await loadUsers();
    } catch (err) {
      setError(err.message);
    }
  }

  function handleEdit(user) {
    setSuccess('');
    setError('');
    setEditingUser(user);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <section>
      <h1>Users</h1>

      <Message type="error" text={error} />
      <Message type="success" text={success} />

      <UserForm
        editingUser={editingUser}
        onSubmit={handleSave}
        onCancel={() => setEditingUser(null)}
      />

      {loading ? (
        <p className="empty">Loading users...</p>
      ) : (
        <UserTable users={users} onEdit={handleEdit} onDelete={handleDelete} />
      )}
    </section>
  );
}
