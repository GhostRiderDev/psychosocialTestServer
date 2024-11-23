const express = require('express');
const { sendNotification, ge, getNotification } = require('../controllers/notificationController');
const router = express.Router();

const { isValidUser } = require('../middlewares.js/auth');

router.post("/send", sendNotification)
router.get("/all", isValidUser, getNotification)

module.exports = router;