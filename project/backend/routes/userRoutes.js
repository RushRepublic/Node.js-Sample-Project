const express = require('express');
const controller = require('../controllers/userController');
const { validateId, validateUserBody } = require('../middleware/validateUser');
const { handleUpload } = require('../middleware/upload');

const router = express.Router();

// These paths are added after /api/users (see server.js).
// handleUpload reads the optional photo and video files that come with the form.
router.get('/', controller.getUsers);                                                  // GET    /api/users
router.get('/:id', validateId, controller.getUser);                                    // GET    /api/users/:id
router.post('/', handleUpload, validateUserBody, controller.createUser);               // POST   /api/users
router.put('/:id', validateId, handleUpload, validateUserBody, controller.updateUser); // PUT    /api/users/:id
router.delete('/:id', validateId, controller.deleteUser);                              // DELETE /api/users/:id

module.exports = router;
