const Response = require("../helpers/response");
const {
  getCurrentDateAndTimeFormatted,
  addMinutes,
} = require("../helpers/timeChecker");
const Apointment = require("../models/Apointment");
const Sheidule = require("../models/Sheidule");
const Subscription = require("../models/Subscription");
const Therapist = require("../models/Therapist");
const User = require("../models/User");
const pagination = require("../helpers/pagination");
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

// const sheidule = async (req, res) => {
//     try {
//         const date = req.body.date;
//         const times = req.body.time;
//         const therapistId = req.body.userId;

//         // Validate the therapist
//         const therapist = await Therapist.findById(therapistId);
//         if (!therapist) {
//             return res.status(400).json(Response({ message: "Therapist not found", type: "Therapist", status: "Not Found", statusCode: 400 }));
//         }

//         // Unauthorized check (though this seems redundant if `findById` was used correctly)
//         if (therapist._id.toString() !== therapistId) {
//             return res.status(400).json(Response({ message: "Unauthorized", type: "Therapist", status: "Unauthorized", statusCode: 400 }));
//         }

//         // Iterate over times and create separate documents for each time
//         const schedules = await Promise.all(times.map(async (time) => {
//             return await Sheidule.create({ date, time, therapistId });
//         }));

//         res.status(201).json(Response({ message: "Schedules have been created successfully", data: schedules, type: "Therapist", status: "Success", statusCode: 201 }));
//     } catch (error) {
//         console.log(error.message);
//         res.status(500).json(Response({ message: error.message }));
//     }
// };

const sheidule = async (req, res) => {
  try {
    const { date, time: times, userId: therapistId } = req.body;

    // Validate the therapist
    const therapist = await Therapist.findById(therapistId);
    if (!therapist) {
      return res.status(400).json({
        message: "Therapist not found",
        type: "Therapist",
        status: "Not Found",
        statusCode: 400,
      });
    }

    // Convert date to 'YYYY-MM-DD' format
    const formattedDate = new Date(date).toISOString().split("T")[0];

    // Check for existing schedules with the same date and time
    const existingSchedules = await Sheidule.find({
      therapistId,
      date: formattedDate,
      time: { $in: times },
    });

    if (existingSchedules.length > 0) {
      return res.status(400).json(
        Response({
          message:
            "You already have schedule on this time, please select different",
          type: "Schedule",
          status: "Conflict",
          statusCode: 400,
        })
      );
    }

    // Iterate over times and create separate documents for each time
    const schedules = await Promise.all(
      times.map(async (time) => {
        return await Sheidule.create({
          date: formattedDate,
          time,
          therapistId,
        });
      })
    );

    res.status(201).json({
      message: "Schedules have been created successfully",
      data: schedules,
      type: "Schedule",
      status: "Success",
      statusCode: 201,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getSheidule = async (req, res) => {
  try {
    const therapistId = req.params.therapistId;
    const date = req.params.date;
    const modifiedDate = date.includes("T") ? date.split("T")[0] : date;
    console.log(date);
    const search = Number(req.query.search) || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 2;
    const searchRexExp = new RegExp(".*" + search + ".*", "i");
    const userId = req.body.userId;

    const sheidule = await Sheidule.find({
      therapistId: therapistId,
      date: modifiedDate,
      isBooked: { $ne: true },
    })
      .limit(limit)
      .skip((page - 1) * limit);

    const count = await Sheidule.countDocuments();

    res.status(200).json(
      Response({
        message: "Sheidule has been fetched successfully",
        data: sheidule,
        type: "Sheidule",
        status: "Success",
        statusCode: 200,
        pagination: {
          totalPages: Math.ceil(count / limit),
          currentPage: page,
          totalItems: count,
          previousPage: page > 1 ? page - 1 : null,
          nextPage: page < Math.ceil(count / limit) ? page + 1 : null,
        },
      })
    );
  } catch (error) {
    console.log(error);
    res.status(500).json(Response({ message: error.message }));
  }
};

const matchTherapistWithSheidule = async (req, res) => {
  try {
    console.log(req.body.patientId);
    const admin = await User.findById(req.body.userId);
    if (!admin) {
      return res.status(400).json(
        Response({
          message: "Admin not found",
          type: "Admin",
          status: "Not Found",
          statusCode: 400,
        })
      );
    }
    if (!admin.isAdmin) {
      return res.status(401).json(
        Response({
          message: "Unauthorized",
          type: "Admin",
          status: "Unauthorized",
          statusCode: 401,
        })
      );
    }
    const sheidules = await Sheidule.find();

    const patient = await Apointment.findOne({ userId: req.body.patientId });

    if (!patient) {
      return res.status(400).json(
        Response({
          message: "Patient not found",
          type: "Patient",
          status: "Not Found",
          statusCode: 400,
        })
      );
    }

    // Filter sheidules based on date match with patient's date
    const matchedSheidules = sheidules.filter((sheidule) => {
      return sheidule.date.getTime() === patient.date.getTime();
    });

    // Now matchedSheidules contains only the schedules whose date matches the patient's date
    res.status(200).json(
      Response({
        message: "Sheidules have been fetched successfully",
        data: matchedSheidules,
        type: "Sheidule",
        status: "Success",
        statusCode: 200,
      })
    );
  } catch (error) {
    console.log(error);
    res.status(500).json(Response({ message: error.message }));
  }
};

const assignTherapistToPatient = async (req, res) => {
  try {
    const admin = await User.findById(req.body.userId);
    if (!admin) {
      return res.status(400).json(
        Response({
          message: "Admin not found",
          type: "Admin",
          status: "Not Found",
          statusCode: 400,
        })
      );
    }
    if (!admin.isAdmin) {
      return res.status(401).json(
        Response({
          message: "Unauthorized",
          type: "Admin",
          status: "Unauthorized",
          statusCode: 401,
        })
      );
    }
    const patientId = req.body.patientId;
    const therapistId = req.body.therapistId;
    const patient = await Apointment.findOne({ userId: patientId });
    const therapist = await Therapist.findById(therapistId);
    console.log("h-------", patient);
    console.log("h-------", therapist);
    if (!patient) {
      return res.status(400).json(
        Response({
          message: "Patient not found",
          type: "Patient",
          status: "Not Found",
          statusCode: 400,
        })
      );
    }
    patient.referTo = therapistId;
    await patient.save();
    res.status(200).json(
      Response({
        message: "Therapist has been assigned to the patient successfully",
        data: patient,
        type: "Patient",
        status: "Success",
        statusCode: 200,
      })
    );
  } catch (error) {
    res.status(500).json(Response({ message: error.message }));
  }
};

const apointmentDetailsForDoctors = async (req, res) => {
  try {
    console.log(req.body.userId);
    const therapistId = req.body.userId;
    const therapist = await Therapist.findById(therapistId);
    console.log(therapist);
    if (!therapist) {
      return res.status(400).json(
        Response({
          message: "Therapist not found",
          type: "Therapist",
          status: "Not Found",
          statusCode: 400,
        })
      );
    }
    if (therapist._id === therapistId) {
      return res.status(401).json(
        Response({
          message: "Unauthorized",
          data: therapist,
          type: "Therapist",
          status: "Unauthorized",
          statusCode: 401,
        })
      );
    }
    const patient = await Apointment.find({ referTo: therapistId });
    res.status(200).json(
      Response({
        message: "Patient has been fetched successfully",
        data: patient,
        type: "Patient",
        status: "Success",
        statusCode: 200,
      })
    );
  } catch (error) {
    res.status(500).json(Response({ message: error.message }));
  }
};

const createSheidule = async (req, res) => {
  try {
    const { sheidule } = req.body;
    const adminId = req.body.userId;
    const admin = await User.findById(adminId);
    if (sheidule.date.length < 1) {
      return res.status(400).json(
        Response({
          message: "Date is required",
          type: "Sheidule",
          status: "Bad Request",
          statusCode: 400,
        })
      );
    }
    if (!admin) {
      return res.status(400).json(
        Response({
          message: "Admin not found",
          type: "Admin",
          status: "Not Found",
          statusCode: 400,
        })
      );
    }
    if (!admin.isAdmin) {
      return res.status(401).json(
        Response({
          message: "Unauthorized",
          type: "Admin",
          status: "Unauthorized",
          statusCode: 401,
        })
      );
    }
    const newsSheidule = await Sheidule.create(sheidule);
    res.status(201).json(
      Response({
        message: "Sheidule has been created successfully",
        data: newsSheidule,
        type: "Sheidule",
        status: "Success",
        statusCode: 201,
      })
    );
  } catch (error) {
    res.status(500).json(Response({ message: error.message }));
  }
};

const bookSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { userId } = req.body;

    console.log("User ID:", userId);

    // Find the schedule by its ID
    const schedule = await Sheidule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({
        message: "Schedule not found",
        status: "Error",
        statusCode: 404,
      });
    }

    // Find the appointment for the user
    let appointment = await Apointment.findOne({ userId: userId });
    if (!appointment) {
      appointment = new Apointment({ userId: userId });
    }
    console.log("Appointment found or created:", appointment);

    // Find the subscription package for the user
    const subscriptionPackage = await Subscription.findOne({ userId: userId });
    if (!subscriptionPackage) {
      return res.status(404).json({
        message: "Subscription package not found",
        status: "Error",
        statusCode: 404,
      });
    }
    console.log("Subscription package:", subscriptionPackage);

    // Check if there are available sessions for booking
    if (subscriptionPackage.sessionCount === 0) {
      return res.status(400).json({
        message: "Please buy a package",
        status: "Error",
        statusCode: 400,
      });
    }

    // Update schedule and appointment
    appointment.scheduleId = scheduleId;
    schedule.userId = userId;
    schedule.isBooked = true;

    await schedule.save();
    await appointment.save();

    subscriptionPackage.sessionCount -= 1;
    await subscriptionPackage.save();

    res.status(200).json({
      message: "Schedule booked successfully",
      data: schedule,
      status: "Okay",
      statusCode: 200,
    });
  } catch (error) {
    console.error("Error booking schedule:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getSheiduleByTherapist = async (req, res) => {
  try {
    console.log("meow");
    const date = req.params.date;
    const modifiedDate = date.includes("T") ? date.split("T")[0] : date;
    const therapistId = req.body.userId;
    console.log(therapistId);
    const therapistSchedule = await Sheidule.find({
      therapistId: therapistId,
      date: modifiedDate,
    });
    if (!therapistSchedule) {
      res.status(404).json(
        Response({
          message: "No schedule found on this date",
          status: "Not Found",
          statusCode: 404,
        })
      );
    }
    res.status(200).json(
      Response({
        message: "Therapist sheidule get succesfully",
        data: therapistSchedule,
        status: "Okay",
        statusCode: 200,
      })
    );
  } catch (error) {
    res.status(200).json(Response({ message: "Internal server error" }));
  }
};

const completedSession = async (req, res) => {
  try {
    const therapistId = req.body.userId;
    console.log("hiiiiiiiiiii", therapistId);
    const completedSession = await Sheidule.countDocuments({
      therapistId: therapistId,
      completed: true,
    });
    const totalSession = await Sheidule.countDocuments({
      therapistId: therapistId,
      completed: false,
    });

    console.log(completedSession);
    res.status(200).json(
      Response({
        message: "Completed session count",
        data: {
          completedSession: completedSession,
          totalSession: totalSession,
        },
        status: "Okay",
        stausCode: 200,
      })
    );
  } catch (error) {
    res.status(500).json(Response({ message: "Internal server error" }));
  }
};

const checkValidSchedule = async (req, res) => {
  try {
    const userId = req.body.userId;
    const convertedUserId = new ObjectId(userId);
    const therapistId = req.params.therapistId;
    const { formattedDate, formattedTime } = getCurrentDateAndTimeFormatted();

    console.log(
      `Formatted Date: ${formattedDate}, Formatted Time: ${formattedTime}`
    );

    const schedule = await Sheidule.findOne({
      $or: [{ userId: convertedUserId }, { therapistId: therapistId }],
    });

    console.log(schedule);

    if (!schedule) {
      return res.status(404).json(
        Response({
          message: "Schedule not found",
          statusCode: 404,
          status: "Okay",
        })
      );
    }

    const scheduleDate = schedule.date;
    const scheduleFromTime = schedule.time[0].from;
    const scheduleFromTimePlus40Minutes = addMinutes(scheduleFromTime, 40);

    if (
      formattedDate !== scheduleDate ||
      formattedTime < scheduleFromTime ||
      formattedTime > scheduleFromTimePlus40Minutes
    ) {
      return res.status(404).json(
        Response({
          message: "You don't have a schedule at this time",
          statusCode: 404,
          status: "Okay",
        })
      );
    }

    return res.status(200).json(
      Response({
        message: "Schedule is valid",
        statusCode: 200,
        status: "Okay",
      })
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).json(Response({ message: "Internal Server Error" }));
  }
};

const afterSessionCalculate = async (req, res) => {
  try {
    const scheduleId = req.params.scheduleId;
    const status = req.body.status;

    // Retrieve the schedule by ID
    const schedule = await Sheidule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json(
        Response({
          message: "Schedule not found",
          status: "Not Found",
          statusCode: 404,
        })
      );
    }

    // Retrieve the user's subscription by userId from the schedule
    const userSubscription = await Subscription.findOne({
      userId: schedule.userId,
    });
    if (!userSubscription) {
      return res.status(404).json(
        Response({
          message: "Subscription not found",
          status: "Not Found",
          statusCode: 404,
        })
      );
    }

    let therapistPayment;

    // Calculate the therapist payment based on the status
    if (status === "VideoCompleted") {
      therapistPayment = userSubscription.price * 0.45;
    } else if (status === "AudioCompleted") {
      therapistPayment = userSubscription.price * 0.4;
    } else {
      return res.status(400).json(
        Response({
          message: "Invalid status",
          status: "Bad Request",
          statusCode: 400,
        })
      );
    }

    // Update the schedule with the therapist payment and mark it as completed
    schedule.therapistPayment = therapistPayment;
    schedule.completed = true;
    await schedule.save();

    // Send a successful response
    res.status(200).json(
      Response({
        message: "Session completed successfully",
        status: "Okay",
        statusCode: 200,
        data: schedule,
      })
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).json(
      Response({
        message: "Internal server error",
        status: "Error",
        statusCode: 500,
      })
    );
  }
};

const therapistPayment = async (req, res) => {
  try {
    // const page = Number(req.query.page) || 1;
    // const limit = Number(req.query.limit) || 1; // Corrected here
    const therapist = await Sheidule.find({ completed: true })
      // .skip((page - 1) * limit)
      // .limit(limit)
      .populate("therapistId");
    const therapistCount = await Sheidule.countDocuments({ completed: true });
    res.status(200).json(
      Response({
        message: "Need to payment therapist",
        data: therapist,
        // pagination: info,
        status: "Okay",
        statusCode: 200, // Fixed typo
      })
    );
  } catch (error) {
    console.log(error.message);
    res.status(500).json(Response({ message: "Internal server Error" }));
  }
};

const recentSession = async (req, res) => {
  try {
    const { date } = req.query; // Get the date from the query parameters

    // Create the query object
    let query;
    if (date) {
      query = { completed: false, date: date };
    }

    // Find sessions where completed is false and filter by the date, sort by createdAt in descending order
    const recentSessions = await Sheidule.find(query)
      .sort({ createdAt: -1 })
      .populate("therapistId");

    res.status(200).json({
      data: recentSessions,
      message: "Recent session retrieved successfully",
      status: "Okay",
      statusCode: 200,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const allAppontment = async (req, res) => {
  try {
    const allAppointments = await Sheidule.find({})
      .populate("therapistId")
      .populate("userId");
    res.status(200).json(
      Response({
        message: "All apointment retrieve seccesfuly",
        data: allAppointments,
        status: "Okay",
        statusCode: 200,
      })
    );
  } catch (error) {
    res.status(500).json(Response({ message: "Internal server error" }));
  }
};

module.exports = {
  sheidule,
  getSheidule,
  matchTherapistWithSheidule,
  assignTherapistToPatient,
  apointmentDetailsForDoctors,
  createSheidule,
  bookSchedule,
  getSheiduleByTherapist,
  completedSession,
  checkValidSchedule,
  afterSessionCalculate,
  therapistPayment,
  recentSession,
  allAppontment,
};
