const express = require("express");
const router = express.Router();

//import controllers
const {
  apply,
  acceptTherapistRequest,
  getTherapist,
  signIn,
  therapistProfile,
  updateTherapist,
  therapistRequest,
  therapistPayment,
  verifyCode,
} = require("../controllers/therapistController");

//import middleware
const upload = require("../middlewares.js/fileUpload");
const uploadMiddleware = require("../middlewares.js/multipleUpload");
const { isValidUser } = require("../middlewares.js/auth");
const { assignTherapist } = require("../controllers/apointmentController");

// routes
router.post("/apply", uploadMiddleware, apply);
router.post("/verify-code", verifyCode);
router.get("/therapist-profile", isValidUser, therapistProfile);
router.post("/action/:therapistId", isValidUser, acceptTherapistRequest);
router.get("/all", isValidUser, getTherapist);
router.get("/:therapistId", isValidUser, getTherapist);
router.post("/sign-in", signIn);
router.post("/update", upload.single("image"), isValidUser, updateTherapist);
router.get("/applied/therapist", therapistRequest);
router.get("/payment/count/:therspistId", therapistPayment);

module.exports = router;
