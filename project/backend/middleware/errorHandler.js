const { removeUploadedFiles } = require('./upload');

// Runs when no route matched the request URL.
function notFound(req, res, next) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// Runs when any route calls next(error) or throws an error.
// Express knows this is an error handler because it has 4 parameters.
function errorHandler(err, req, res, next) {
  // The request failed, so do not keep files that were uploaded with it.
  removeUploadedFiles(req.files);

  // MySQL says the email already exists (UNIQUE column).
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ message: 'A user with this email already exists.' });
  }

  // Malformed JSON sent by the client.
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON in request body.' });
  }

  const status = err.status || 500;
  if (status === 500) console.error(err);

  // Do not leak internal details (like SQL errors) for server errors.
  const message = status === 500 ? 'Something went wrong on the server.' : err.message;

  res.status(status).json({ message });
}

module.exports = { notFound, errorHandler };
