const express = require('express');
const router = express.Router();

// Import controllers
const { mewoImageUpload } = require('../controllers/meowUplaodController');

// Import the multer middleware
const uploadMiddleware = require('../middlewares.js/multipleUpload');
const socketIO = require('../controllers/socketController');

// Route for uploading multiple images from multiple fields
router.post('/meow', uploadMiddleware, mewoImageUpload);
router.post('/mewo/mewow', socketIO);

module.exports = router;

