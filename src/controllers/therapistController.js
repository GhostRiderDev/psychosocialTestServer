const Response = require("../helpers/response");
const SelectTherapy = require("../models/SelectTherapy");
const Therapist = require("../models/Therapist");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { userLogin } = require("../services/userService");
const { createJSONWebToken } = require("../helpers/jsonWebToken");
const emailWithNodemailer = require("../helpers/email");
const { deleteImage } = require("../helpers/deleteImage");
const pagination = require("../helpers/pagination");
const Sheidule = require("../models/Sheidule");

const apply = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      therapistType,
      dateOfBirth,
      phone,
      countryCode,
    } = req.body;
    const image = req.files["image"];
    console.log("image", image);
    let modifiedImage;
    console.log(modifiedImage);
    if (image) {
      modifiedImage = {
        publicFileURL: image[0].path,
        path: image[0].path,
      };
    }
    console.log("modifiedImage", modifiedImage);
    const certificate = req.files["certificate"];
    console.log("certificate", certificate);
    let modifiedCertificate;
    if (certificate) {
      modifiedCertificate = {
        publicFileURL: certificate[0].path,
        path: certificate[0].path,
      };
    }
    const resume = req.files["resume"];
    console.log("resume", resume);
    let modifiedResume;
    if (resume) {
      modifiedResume = {
        publicFileURL: resume[0].path,
        path: resume[0].path,
      };
    }
    console.log("modifiedResume", modifiedResume);

    // Generate OTC (One-Time Code)
    const oneTimeCode =
      Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    // Prepare email for activate user
    const emailData = {
      email,
      subject: "Account Activation Email",
      html: `
          <h1>Hello, ${name}</h1>
          <p>Your One Time Code is <h3>${oneTimeCode}</h3> to verify your email</p>
          <small>This Code is valid for 3 minutes</small>
          `,
    };

    // Send email
    try {
      emailWithNodemailer(emailData);
    } catch (emailError) {
      console.error("Failed to send verification email", emailError);
      res
        .status(500)
        .json({ message: "Error creating user", error: emailError });
    }

    const therapistExists = await Therapist.findOne({ email });
    if (therapistExists) {
      return res.status(400).json(
        Response({
          message: "Email already exists",
          status: "Bad Request",
          statusCode: 400,
        })
      );
    }
    const therapist = await Therapist.create({
      name,
      resume: modifiedResume,
      therapistType,
      certificate: modifiedCertificate,
      email,
      password,
      image: modifiedImage,
      oneTimeCode,
      dateOfBirth,
      phone,
      countryCode,
    });

    // Set a timeout to update the oneTimeCode to null after 1 minute
    setTimeout(async () => {
      try {
        therapist.oneTimeCode = null;
        await therapist.save();
        console.log("oneTimeCode reset to null after 3 minutes");
      } catch (error) {
        console.error("Error updating oneTimeCode:", error);
      }
    }, 180000); // 3 minutes in milliseconds
    res.status(201).json(
      Response({
        message: "Apply as a therapist is successfully",
        status: "Created",
        statusCode: 201,
        data: therapist,
      })
    );
  } catch (error) {
    console.log(error.message);
    res.status(500).json(
      Response({
        message: "Internal server error",
        status: "Internal Server Error",
        statusCode: 500,
      })
    );
  }
};

//Sign in user
const signIn = async (req, res, next) => {
  try {
    // Get email and password from req.body
    const { email, password } = req.body;
    console.log(email, password);

    // Find the user by email
    const therapist = await Therapist.findOne({ email: email });

    if (!therapist) {
      return res.status(404).json(
        Response({
          statusCode: 404,
          message: "User not found",
          status: "Failed",
        })
      );
    }

    // Check if the user is banned
    if (therapist.isBlocked) {
      return res.status(401).json(
        Response({
          statusCode: 401,
          message: "You are blocked",
          status: "Failed",
        })
      );
    }

    // if (therapist.accepted === false) {
    //     return res.status(401).json(Response({message: "You are not authorized", statusCode: 401, status: "Unauthorized"}))
    // }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = bcrypt.compare(password, therapist.password);
    console.log("---------------", isPasswordValid);

    if (!isPasswordValid) {
      res.status(401).json(
        Response({
          statusCode: 401,
          message: "Invalid password",
          status: "Failed",
        })
      );
    }

    // Call userLogin service function
    // const accessToken = await userLogin({ email, password, therapist });
    const expiresInOneYear = 365 * 24 * 60 * 60; // seconds in 1 year
    const accessToken = createJSONWebToken(
      { _id: therapist._id, email: therapist.email },
      process.env.JWT_SECRET_KEY,
      expiresInOneYear
    );

    //Success response
    res.status(200).json(
      Response({
        statusCode: 200,
        message: "Authentication successful",
        status: "OK",
        data: therapist,
        token: accessToken,
        type: "user",
      })
    );
  } catch (error) {
    console.log(error.message);
    next(
      Response({
        statusCode: 500,
        message: "Internal server error",
        status: "Failed",
      })
    );
  }
};

const therapistProfile = async (req, res) => {
  console.log("req.body.userId", req.body.userId);
  try {
    const therapist = await Therapist.findById(req.body.userId);
    console.log("-------------", therapist);
    if (!therapist) {
      return res.status(404).json(
        Response({
          statusCode: 404,
          message: "User not found",
          status: "Failed",
        })
      );
    }
    res.status(200).json(
      Response({
        statusCode: 200,
        message: "Therapist found",
        status: "OK",
        data: therapist,
      })
    );
  } catch (error) {
    console.error(error);
    res.status(500).json(
      Response({
        statusCode: 500,
        message: "Internal server error",
        status: "Failed",
      })
    );
  }
};

const acceptTherapistRequest = async (req, res) => {
  try {
    const { therapistId } = req.params;
    const actionType = req.body.actionType;
    console.log(therapistId);
    const checkAdmin = await User.findById(req.body.userId);
    console.log(checkAdmin);
    if (checkAdmin.isAdmin !== true) {
      return res.status(400).json(
        Response({
          message: "You are not authorize",
          status: "Bad Request",
          statusCode: "400",
        })
      );
    }

    const therapist = await Therapist.findById(therapistId);
    console.log(therapist);
    if (!therapist) {
      return res.status(404).json(
        Response({
          message: "Therapist not found",
          status: "Not Found",
          statusCode: "404",
        })
      );
    }
    if (therapist.accepted === true) {
      return res.status(400).json(
        Response({
          message: "Therapist already accepted",
          status: "Bad Request",
          statusCode: "400",
        })
      );
    }
    if (actionType === "delete") {
      await Therapist.deleteOne(therapist._id);
      return res.status(400).json(
        Response({
          message: "Therapist request delete successfully",
          status: "OK",
          statusCode: "200",
        })
      );
    }
    therapist.accepted = true;
    await therapist.save();
    res.status(200).json(
      Response({
        message: "Therapist accepted successfully",
        status: "OK",
        statusCode: "200",
      })
    );
  } catch (error) {
    console.log(error.message);
    res.status(500).json(
      Response({
        message: "Internal Server Error",
        status: "Internal Server Error",
        statusCode: "500",
      })
    );
  }
};

const getTherapist = async (req, res) => {
  console.log("get therapist");
  try {
    const limit = parseInt(req.query.limit) || 2; // Default limit is 10, or use the provided limit if any
    const page = parseInt(req.query.page) || 1; // Default page is 1, or use the provided page if any

    const therapistCount = await Therapist.countDocuments({ accepted: true });
    const pageInfo = pagination(therapistCount, limit, page);

    const therapists = await Therapist.find({ accepted: true })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json(
      Response({
        message: "Therapists found successfully",
        status: "OK",
        statusCode: "200",
        data: therapists,
        pagination: pageInfo,
      })
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).json(
      Response({
        message: "Internal Server Error",
        status: "Internal Server Error",
        statusCode: "500",
      })
    );
  }
};

const newTherapistForMessage = async (req, res) => {
  console.log("fsjdfhksjfh");
  try {
    const therapists = await Therapist.find().sort({ createdAt: -1 });
    console.log(therapists[0]);
    if (!therapists) {
      res.status(200).json(
        Response({
          message: "No therapist found",
          statusCode: 404,
          status: "Not Found",
        })
      );
    }
    res.status(200).json(
      Response({
        data: therapists,
        message: "Thearapist for welcome message",
        status: "Okay",
        statusCode: 200,
      })
    );
  } catch (error) {
    console.log(error.message);
    res.status(500).json(Response({ message: "Internal server error" }));
  }
};

const getSingleUser = async (req, res) => {
  try {
    const { userId } = req.body.userId;
    const user = await User.findById(userId);
  } catch (error) {
    res.status(500).json(
      Response({
        message: "Internal Server Error",
        status: "Internal Server Error",
        statusCode: "500",
      })
    );
  }
};

const updateTherapist = async (req, res) => {
  try {
    const { name, email, therapistType, dateOfBirth, phone, countryCode } =
      req.body;
    console.log("dateOfBirth", dateOfBirth);
    const image = req.file;
    console.log("image", image);
    let modifiedImage;
    if (image) {
      modifiedImage = {
        publicFileURL: image.path,
        path: image.path,
      };
    }
    console.log("modifiedImage", modifiedImage);
    // Check if userId is provided and valid
    if (!req.body.userId) {
      return res.status(400).json({ message: "Therapist ID is required" });
    }

    // Find the therapist by userId
    const therapist = await Therapist.findById(req.body.userId);

    // Check if therapist exists
    if (!therapist) {
      return res.status(404).json({ message: "Therapist not found" });
    }

    if (name) {
      therapist.name = name;
    }
    if (email) {
      therapist.email = email;
    }
    if (therapistType) {
      therapist.therapistType = therapistType;
    }
    if (dateOfBirth) {
      therapist.dateOfBirth = dateOfBirth;
    }
    if (phone) {
      therapist.phone = phone;
    }
    if (countryCode) {
      therapist.countryCode = countryCode;
    }
    console.log("therapist", therapist.image);
    // Handle image update
    if (image) {
      // Delete previous image if it exists
      if (therapist.image && therapist.image.path) {
        deleteImage(therapist.image.path);
      }
      therapist.image = modifiedImage;
      await therapist.save();
    }
    res.status(200).json(
      Response({
        message: "Therapist updated",
        statusCode: 200,
        status: "Updated",
      })
    );
  } catch (error) {
    console.log(error.message);
    res.status(500).json(
      Response({
        message: "Error updating Therapist",
        statusCode: 500,
        status: "Error",
      })
    );
  }
};

const therapistRequest = async (req, res) => {
  try {
    const therapist = await Therapist.find({ accepted: false });
    console.log(therapist);
    res
      .status(200)
      .json(Response({ message: "Requested therapist", data: therapist }));
  } catch (error) {
    console.log(error.message);
    res.status(200).json("send");
  }
};

const therspistPayment = async (req, res) => {
  try {
    const therspistId = req.params.therapistId;
    const therapistPaymentCount = await Sheidule.find({
      therspistId: therspistId,
    });
    // Sum up the therapistPayment values
    const totalPayment = therapistPaymentCount
      .filter((payment) => payment.therapistPayment !== undefined)
      .reduce((acc, payment) => acc + payment.therapistPayment, 0);
    res.status(200).json(
      Response({
        message: "Therspist payment",
        data: totalPayment,
        status: 200,
        statusCode: "Okay",
      })
    );
  } catch (error) {
    res.status(200).json(Response({ message: "Internal server error" }));
  }
};

module.exports = {
  apply,
  acceptTherapistRequest,
  getTherapist,
  getSingleUser,
  getSingleUser,
  signIn,
  therapistProfile,
  updateTherapist,
  newTherapistForMessage,
  therapistRequest,
  therspistPayment,
  therspistPayment,
};
