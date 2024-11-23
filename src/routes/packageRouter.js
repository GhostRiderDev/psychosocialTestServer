const express = require('express');
const router = express.Router();

//import controllers
const { createPackage, getPackages, selectPackage } = require('../controllers/packageController');

//Import helper functions
const upload = require('../middlewares.js/fileUpload');
const { isValidUser } = require('../middlewares.js/auth');

// routes
router.post('/add', isValidUser, createPackage);
router.get('/all', getPackages);
router.post('/select', isValidUser, selectPackage);

module.exports = router;