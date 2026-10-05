const { removeUploadedFiles } = require('./upload');

// Checks run BEFORE the controller. If something is wrong we answer 400 (Bad Request).

function validateId(req, res, next) {
  if (!/^\d+$/.test(req.params.id)) {
    return res.status(400).json({ message: 'User id must be a positive whole number.' });
  }
  next();
}

function validateUserBody(req, res, next) {
  const body = req.body || {};
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';

  // If the data is invalid, also delete any files that were uploaded with it.
  if (!name || name.length > 100) {
    removeUploadedFiles(req.files);
    return res.status(400).json({ message: 'Name is required and must be 100 characters or less.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) {
    removeUploadedFiles(req.files);
    return res.status(400).json({ message: 'A valid email address is required.' });
  }

  // Pass the cleaned values on to the controller. Files stay in req.files.
  req.body = { name, email };
  next();
}

module.exports = { validateId, validateUserBody };
