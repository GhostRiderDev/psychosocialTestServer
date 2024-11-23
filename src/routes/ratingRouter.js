const express = require('express');
const { isValidUser } = require('../middlewares.js/auth');
const { createRating } = require('../controllers/ratingController');
const router = express.Router();

router.post("/create/:therapistId", isValidUser, createRating)

module.exports = router;