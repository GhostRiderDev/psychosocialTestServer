const express = require('express');
const router = express.Router();

//import controllers
const { chooseTherapy } = require('../controllers/selectTherapyController');
//Import helper functions
const upload = require('../middlewares.js/fileUpload');
const { isValidUser } = require('../middlewares.js/auth');

// routes
router.post('/choose', chooseTherapy);

module.exports = router;