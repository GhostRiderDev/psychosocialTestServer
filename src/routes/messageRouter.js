const express = require('express');
const { getUserSpecificChat, getChatList, fileMessage } = require('../controllers/messageController');
const upload = require('../middlewares.js/fileUpload');
const { isValidUser } = require('../middlewares.js/auth');
const router = express.Router();

//import controllers


//Import helper functions

// routes
router.get('/chat/:participant', isValidUser, getUserSpecificChat);
router.get('/chat-list', isValidUser, getChatList);
router.post('/file', upload.single("image"), fileMessage);

module.exports = router;