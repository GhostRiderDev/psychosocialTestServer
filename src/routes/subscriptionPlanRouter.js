const express = require('express');
const router = express.Router();

//import controllers
const { createSubscription, getSubscription, buySubscription } = require('../controllers/subscriptionController');
const upload = require('../middlewares.js/fileUpload');
const { isValidUser } = require('../middlewares.js/auth');

// routes
router.post('/create-plan', createSubscription);
router.get('/get-plan', getSubscription);
router.post('/buy-plan/:planId', isValidUser, buySubscription);

module.exports = router;