import { mediaUrl } from '../api/usersApi.js';

export default function UserTable({ users, onEdit, onDelete }) {
  if (users.length === 0) {
    return <p className="empty">No users yet. Add the first one above.</p>;
  }

  return (
    <div className="card table-wrapper">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Photo</th>
            <th>Video</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                {user.photo ? (
                  <a href={mediaUrl(user.photo)} target="_blank" rel="noreferrer">
                    <img src={mediaUrl(user.photo)} alt={`Photo of ${user.name}`} className="thumb" />
                  </a>
                ) : (
                  <span className="no-media">-</span>
                )}
              </td>
              <td>
                {user.video ? (
                  <video src={mediaUrl(user.video)} className="thumb-video" controls preload="metadata" />
                ) : (
                  <span className="no-media">-</span>
                )}
              </td>
              <td>{new Date(user.created_at).toLocaleDateString()}</td>
              <td className="actions">
                <button className="btn small" onClick={() => onEdit(user)}>Edit</button>
                <button className="btn small danger" onClick={() => onDelete(user)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
