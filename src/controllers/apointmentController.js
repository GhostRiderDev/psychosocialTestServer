const pagination = require("../helpers/pagination");
const Response = require("../helpers/response");
const Apointment = require("../models/Apointment");
const Package = require("../models/Package");
const Sheidule = require("../models/Sheidule");
const User = require("../models/User");

const getApointment = async (req, res) => {
  const { packageId, date, time } = req.body;
  const package = await Package.findById(packageId);
  if (!package) {
    res.status(404).json(
      Response({
        message: "Package not found",
        type: "Package",
        status: "Not Found",
        statusCode: 404,
      })
    );
    return;
  }
  const checkUser = await User.findOne({ _id: req.body.userId });
  if (!checkUser) {
    res.status(401).json(
      Response({
        message: "Unauthorized",
        type: "Package",
        status: "Unauthorized",
        statusCode: 401,
      })
    );
  }
  const apointment = await Apointment.create({
    userId: checkUser._id,
    packageId,
    date,
    time,
  });

  res.status(200).json(
    Response({
      message: "Package selected successfully",
      data: apointment,
      type: "Package",
      status: "OK",
      statusCode: 200,
    })
  );
};

const assignTherapist = async (req, res) => {
  try {
    const therapistId = req.body.therapistId;
    const userId = req.params.userId;

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user already has an assigned therapist
    if (user.assign == true) {
      return res
        .status(200)
        .json({ message: "You already assigned a therapist" });
    }

    // Create the appointment
    const appointment = await Apointment.create({
      userId: userId,
      therapistId: therapistId,
    });

    // Update the user's assign status
    user.assign = true;
    await user.save();

    res.status(200).json({
      message: "Therapist assigned successfully",
      statusCode: 200,
      status: "Okay",
      data: appointment,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json("Internal server error");
  }
};

const myAssignedList = async (req, res) => {
  try {
    const userId = req.body.userId;
    const myAssignment = await Apointment.findOne({
      $or: [{ userId: userId }, { therapistId: userId }],
    })
      .populate("userId")
      .populate("therapistId")
      .populate("scheduleId");

    console.log(myAssignment);
    res.status(200).json(
      Response({
        message: "My appointment",
        data: myAssignment,
        status: "Okay",
        statusCode: 200,
      })
    );
  } catch (error) {
    console.error(error);
    res.status(500).json(Response({ message: "Internal server Error" }));
  }
};

const schedule = async (req, res) => {
  const { date, time } = req.body;
  const apointment = await Apointment.create({
    userId: req.user._id,
    date,
    time,
  });
};

const userApointmentHistory = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const date = req.query.date;
    const userId = req.body.userId;

    // Log userId for debugging
    console.log("User ID:", userId);

    // Validate userId
    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
        statusCode: 400,
        status: "Bad Request",
      });
    }

    // Validate limit and page number
    if (isNaN(limit) || limit < 1) {
      return res.status(400).json({
        message: "Invalid limit number",
        statusCode: 400,
        status: "Bad Request",
      });
    }
    if (isNaN(page) || page < 1) {
      return res.status(400).json({
        message: "Invalid page number",
        statusCode: 400,
        status: "Bad Request",
      });
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Construct query object
    let query = {
      $or: [{ userId: userId }, { therapistId: userId }],
      isBooked: true,
    };
    if (date) {
      query.date = date;
    }

    // Fetch appointments with pagination
    const appointments = await Sheidule.find(query)
      .populate("therapistId")
      .populate("userId")
      .skip(skip)
      .limit(limit);

    // Check if appointments were found
    if (!appointments || appointments.length === 0) {
      return res.status(404).json(
        Response({
          message: "No appointments found",
          statusCode: 404,
          status: "Not Found",
        })
      );
    }

    // Count total appointments for pagination info
    const totalAppointments = await Sheidule.countDocuments(query);

    // Prepare pagination info
    const pageInfo = pagination(totalAppointments, limit, page);

    res.status(200).json(
      Response({
        message: "Schedule retrieved successfully",
        data: appointments,
        statusCode: 200,
        status: "Okay",
        pagination: pageInfo,
      })
    );
  } catch (error) {
    console.error("Error retrieving appointment history:", error.message);
    res.status(500).json({
      message: "Internal server error",
      statusCode: 500,
      status: "Error",
    });
  }
};

module.exports = {
  getApointment,
  // assignDoctor,
  assignTherapist,
  myAssignedList,
  userApointmentHistory,
};
