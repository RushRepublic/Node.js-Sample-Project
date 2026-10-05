const userModel = require('../models/userModel');
const { deleteStoredFile } = require('../middleware/upload');

// Controllers receive the request, call the model, and send the response.
// In Express 5, errors thrown inside async functions go to errorHandler automatically.

// Name of the uploaded file for a field ("photo" or "video"), or null if none was sent.
function uploadedFileName(req, field) {
  return req.files?.[field]?.[0]?.filename || null;
}

async function getUsers(req, res) {
  const users = await userModel.getAllUsers();
  res.json(users);
}

async function getUser(req, res) {
  const user = await userModel.getUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }
  res.json(user);
}

async function createUser(req, res) {
  const { name, email } = req.body;
  const user = await userModel.createUser(
    name,
    email,
    uploadedFileName(req, 'photo'),
    uploadedFileName(req, 'video')
  );
  res.status(201).json(user);
}

async function updateUser(req, res) {
  const existing = await userModel.getUserById(req.params.id);
  if (!existing) {
    // errorHandler is not involved here, so remove the uploaded files ourselves.
    Object.values(req.files || {}).flat().forEach((file) => deleteStoredFile(file.filename));
    return res.status(404).json({ message: 'User not found.' });
  }

  const { name, email } = req.body;
  const newPhoto = uploadedFileName(req, 'photo');
  const newVideo = uploadedFileName(req, 'video');
  const user = await userModel.updateUser(req.params.id, name, email, newPhoto, newVideo);

  // The old files are replaced, so delete them from disk.
  if (newPhoto) deleteStoredFile(existing.photo);
  if (newVideo) deleteStoredFile(existing.video);

  res.json(user);
}

async function deleteUser(req, res) {
  const existing = await userModel.getUserById(req.params.id);
  if (!existing) {
    return res.status(404).json({ message: 'User not found.' });
  }
  await userModel.deleteUser(req.params.id);
  deleteStoredFile(existing.photo);
  deleteStoredFile(existing.video);
  res.json({ message: 'User deleted.' });
}

module.exports = { getUsers, getUser, createUser, updateUser, deleteUser };
