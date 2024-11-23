const express = require('express');
const { sheidule, getSheidule, assignTherapistToPatient, matchTherapistWithSheidule, apointmentDetailsForDoctors, createSheidule, getSheiduleByTherapist, completedSession, checkValidSchedule, afterSessionCalculate, therapistPayment, recentSession, allAppontment } = require('../controllers/sheiduleController');
const { isValidUser } = require('../middlewares.js/auth');
const { bookSchedule } = require('../controllers/sheiduleController');
const router = express.Router();

//import controllers

//import middleware

//routes
router.post('/make', isValidUser, sheidule);
router.get('/all/:therapistId/:date', isValidUser, getSheidule);
router.post('/match', isValidUser, matchTherapistWithSheidule);
router.post('/assign/:therapistId', isValidUser, assignTherapistToPatient);
router.get('/apointment/details', isValidUser, apointmentDetailsForDoctors);
router.post('/create', isValidUser, createSheidule);
router.post('/book/:scheduleId', isValidUser, bookSchedule);
router.get('/therapist/:date', isValidUser, getSheiduleByTherapist);
router.get('/completed-session', isValidUser, completedSession);
router.post('/check-scheidule/:therapistId', isValidUser, checkValidSchedule);
router.post('/session-completed/:scheduleId', afterSessionCalculate);
router.get('/session-completed/pay', therapistPayment);
router.get('/recent/session', recentSession);
router.get('/all/appointment', allAppontment);


module.exports = router;