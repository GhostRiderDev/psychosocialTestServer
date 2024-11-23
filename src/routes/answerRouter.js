const express = require('express');
const router = express.Router();

//import controllers
const { answer, verifyAnswerByAdmin } = require('../controllers/answerController');

//Import helper functions
const upload = require('../middlewares.js/fileUpload');
const { isValidUser } = require('../middlewares.js/auth');

// routes
router.post('/', isValidUser, answer);
router.get('/answered-by-user/:userId', verifyAnswerByAdmin);

module.exports = router;