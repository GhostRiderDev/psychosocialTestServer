const pagination = require("../helpers/pagination");
const Response = require("../helpers/response");
const Package = require("../models/Package");
const Sheidule = require("../models/Sheidule");
const User = require("../models/User");
const TimeSheidule = require("../models/TimeSceidule");
const Therapist = require("../models/Therapist");
const Appointment = require("../models/Apointment");
const SubscriptionPlan = require("../models/SubsCriptionPlan");
const dayjs = require("dayjs");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const getApointment = async (req, res) => {
  const { packageId, date, time, therapistId } = req.body;
  console.log("Package ID:", packageId);
  console.log("Date:", date);
  console.log("Time:", time);
  const package = await SubscriptionPlan.findById(packageId);
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

  const therapist = await Therapist.findById(therapistId);
  if (!therapist) {
    res.status(404).json(
      Response({
        message: "Therapist not found",
        type: "Therapist",
        status: "Not Found",
        statusCode: 404,
      })
    );
    return;
  }

  const apointment = await Appointment.create({
    userId: checkUser._id,
    packageId,
    date,
    time,
    therapistId,
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
    const userId = new ObjectId(req.params.userId);

    const myAssignment = await Appointment.find({
      userId: userId,
    })
      .populate("userId")
      .populate("therapistId");

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
    const userId = req.query.userId;

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
    const appointments = await Appointment.find(query)
      .populate("therapistId")
      .populate("userId")
      .skip(skip)
      .limit(limit);
    console.log(appointments);

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

// Controller
const getAvailableTimesByDate = async (req, res) => {
  try {
    const { date } = req.body;

    if (!date) {
      return res.status(400).json(
        Response({
          message: "Date is required",
          statusCode: 400,
          status: "Bad Request",
        })
      );
    }

    const day = dayjs(date).format("dddd");

    if (day === "Sunday" || day === "Saturday") {
      return res.status(200).json(
        Response({
          message: "No available slots on weekends",
          statusCode: 200,
          status: "OK",
        })
      );
    }
    const therapists = await Therapist.find({
      accepted: true,
      isBlocked: false,
    });

    const slots = [];

    const allAppointmentsToday = await Sheidule.find({ date });
    // Generate slots for each therapist
    for (const therapist of therapists) {
      const existingAppointments = allAppointmentsToday.filter(
        (apt) => apt.therapistId.toString() === therapist._id.toString()
      );

      // Convert existing appointment times to a Set for faster lookup
      const bookedTimes = new Set(
        existingAppointments
          .map((apt) => {
            // If appointment is 60 minutes, block both 30 minute slots
            if (apt.duration === 60) {
              const hour = apt.time.split(":")[0];
              return [`${hour}:00`, `${hour}:30`];
            }
            return apt.time;
          })
          .flat()
      );

      // Generate 30-minute slots
      for (let hour = 8; hour < 18; hour++) {
        if (hour === 12) continue; // Skip lunch hour

        // Skip past hours if date is today
        if (
          dayjs(date).format("YYYY-MM-DD") === dayjs().format("YYYY-MM-DD") &&
          hour < dayjs().hour()
        ) {
          continue;
        }

        const hour24 = hour.toString().padStart(2, "0");

        // Check 30-minute slots
        if (!bookedTimes.has(`${hour24}:00`)) {
          slots.push({
            therapistId: therapist._id,
            date,
            time: `${hour24}:00`,
            duration: 30,
            isAvailable: true,
          });
        }

        if (!bookedTimes.has(`${hour24}:30`)) {
          slots.push({
            therapistId: therapist._id,
            date,
            time: `${hour24}:30`,
            duration: 30,
            isAvailable: true,
          });
        }

        // Check 60-minute slot (only if both 30-min slots are free)
        if (
          !bookedTimes.has(`${hour24}:00`) &&
          !bookedTimes.has(`${hour24}:30`)
        ) {
          slots.push({
            therapistId: therapist._id,
            date,
            time: `${hour24}:00`,
            duration: 60,
            isAvailable: true,
          });
        }
      }
    }

    // Save all slots
    await TimeSheidule.insertMany(slots);

    res.status(200).json(
      Response({
        message: "Time slots generated successfully",
        data: slots,
        statusCode: 200,
        status: "OK",
      })
    );
  } catch (error) {
    console.error("Error generating time slots:", error);
    res.status(500).json(
      Response({
        message: "Error generating time slots",
        statusCode: 500,
        status: "Error",
      })
    );
  }
};

module.exports = {
  getApointment,
  // assignDoctor,
  getAvailableTimesByDate,
  assignTherapist,
  myAssignedList,
  userApointmentHistory,
};
