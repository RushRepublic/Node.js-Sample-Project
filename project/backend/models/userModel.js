const pool = require('../config/db');

// The models only talk to MySQL. Every query uses "?" placeholders
// (parameterized queries), so user input can never be run as SQL.
// photo and video hold the saved file NAME (or NULL when there is none).

const COLUMNS = 'id, name, email, photo, video, created_at';

async function getAllUsers() {
  const [rows] = await pool.execute(`SELECT ${COLUMNS} FROM users ORDER BY id DESC`);
  return rows;
}

async function getUserById(id) {
  const [rows] = await pool.execute(`SELECT ${COLUMNS} FROM users WHERE id = ?`, [id]);
  return rows[0]; // undefined when no user has this id
}

async function createUser(name, email, photo, video) {
  const [result] = await pool.execute(
    'INSERT INTO users (name, email, photo, video) VALUES (?, ?, ?, ?)',
    [name, email, photo, video]
  );
  return getUserById(result.insertId);
}

// COALESCE(?, photo) means: use the new file if there is one, otherwise keep the old one.
async function updateUser(id, name, email, photo, video) {
  await pool.execute(
    'UPDATE users SET name = ?, email = ?, photo = COALESCE(?, photo), video = COALESCE(?, video) WHERE id = ?',
    [name, email, photo, video, id]
  );
  return getUserById(id);
}

async function deleteUser(id) {
  const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);
  return result.affectedRows > 0; // true if a user was deleted
}

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };
