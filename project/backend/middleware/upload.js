const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Where uploaded files are stored. On the server, set UPLOADS_DIR in the environment
// variables to a folder OUTSIDE the app folder so redeploys never delete uploads.
const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const MAX_PHOTO_MB = 5;
const MAX_VIDEO_MB = 50;

// Only these file types are accepted. The saved extension comes from this list
// (never from the user's file name), so a harmful file such as .html can't be stored.
const ALLOWED_TYPES = {
  photo: { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' },
  video: { 'video/mp4': '.mp4', 'video/webm': '.webm', 'video/quicktime': '.mov' },
};

function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    // Random file name, so files never overwrite each other.
    filename: (req, file, cb) => {
      cb(null, crypto.randomUUID() + ALLOWED_TYPES[file.fieldname][file.mimetype]);
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowed = ALLOWED_TYPES[file.fieldname];
    if (allowed && allowed[file.mimetype]) return cb(null, true);
    cb(badRequest(
      file.fieldname === 'photo'
        ? 'Photo must be a JPG, PNG, WEBP or GIF image.'
        : file.fieldname === 'video'
          ? 'Video must be an MP4, WEBM or MOV file.'
          : 'Unexpected file field.'
    ));
  },
  limits: { fileSize: MAX_VIDEO_MB * 1024 * 1024, files: 2 },
}).fields([
  { name: 'photo', maxCount: 1 },
  { name: 'video', maxCount: 1 },
]);

// Deletes files that were just uploaded (used when the request fails afterwards).
function removeUploadedFiles(files) {
  Object.values(files || {}).flat().forEach((file) => fs.unlink(file.path, () => {}));
}

// Deletes one stored file by its saved name (used when replacing or deleting a user).
function deleteStoredFile(filename) {
  if (!filename) return;
  // path.basename makes sure the name can never point outside the uploads folder.
  fs.unlink(path.join(uploadsDir, path.basename(filename)), () => {});
}

// Express middleware. JSON requests (no files) pass straight through.
function handleUpload(req, res, next) {
  upload(req, res, (err) => {
    if (err) {
      removeUploadedFiles(req.files);
      if (err instanceof multer.MulterError) {
        const message = err.code === 'LIMIT_FILE_SIZE'
          ? `File is too large. Photo max ${MAX_PHOTO_MB} MB, video max ${MAX_VIDEO_MB} MB.`
          : 'Invalid file upload.';
        return next(badRequest(message));
      }
      return next(err);
    }

    // Multer has one size limit for both fields, so the smaller photo limit is checked here.
    const photo = req.files && req.files.photo && req.files.photo[0];
    if (photo && photo.size > MAX_PHOTO_MB * 1024 * 1024) {
      removeUploadedFiles(req.files);
      return next(badRequest(`Photo is too large. Max ${MAX_PHOTO_MB} MB.`));
    }
    next();
  });
}

module.exports = { handleUpload, removeUploadedFiles, deleteStoredFile, uploadsDir };
