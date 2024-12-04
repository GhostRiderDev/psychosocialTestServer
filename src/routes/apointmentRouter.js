const express = require("express");
const router = express.Router();

//import controllers
const {
  getApointment,
  assignDoctor,
  assignTherapist,
  myAssignedList,
  userApointmentHistory,
  getAvailableTimesByDate,
} = require("../controllers/apointmentController");

//Import helper functions
const upload = require("../middlewares.js/fileUpload");
const { isValidUser } = require("../middlewares.js/auth");

// routes
router.post("/select", isValidUser, getApointment);
// router.post('/assign/:id', assignDoctor);
router.post("/assign/:userId", assignTherapist);
router.get("/:userId/my-apointment", isValidUser, myAssignedList);
router.get("/my-apointment-history", isValidUser, userApointmentHistory);
router.post("/disponible", isValidUser, getAvailableTimesByDate);

module.exports = router;
