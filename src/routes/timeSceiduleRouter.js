const express = require('express');
const { isValidUser } = require('../middlewares.js/auth');
const { createSceiduleByAdmin } = require('../controllers/timeSceiduleController');
const router = express.Router();

//import controllers

//import middleware

//routes
router.post('/create', createSceiduleByAdmin);


module.exports = router;