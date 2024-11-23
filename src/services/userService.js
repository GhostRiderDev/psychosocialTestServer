const emailWithNodemailer = require("../helpers/email");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { createJSONWebToken } = require("../helpers/jsonWebToken");

const userRegister = async (userDetails) => {
  try {
    // Business logic for user registration
    console.log("Received user details:", userDetails);
    console.log(
      "Received user details (modifiedImage):",
      userDetails.modifiedImage
    );

    let { email, name } = userDetails;

    // Generate OTC (One-Time Code)
    const oneTimeCode =
      Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;

    // Prepare email for activating user
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
      await emailWithNodemailer(emailData);
    } catch (emailError) {
      console.error("Failed to send verification email", emailError);
      throw new Error("Error sending verification email");
    }

    // Add the one-time code to the user details
    let newUserDetails = { ...userDetails, oneTimeCode: oneTimeCode };

    // Create the user
    const user = await User.create(newUserDetails);

    // Set a timeout to update the oneTimeCode to null after 3 minutes
    setTimeout(async () => {
      try {
        user.oneTimeCode = null;
        await user.save();
        console.log("oneTimeCode reset to null after 3 minutes");
      } catch (error) {
        console.error("Error updating oneTimeCode:", error);
      }
    }, 180000); // 3 minutes in milliseconds

    return user; // Return the newly created user
  } catch (error) {
    console.error("Error in userRegister service:", error.message);
    throw new Error("Error occurred while registering user");
  }
};
const userLogin = async ({ email, password, user }) => {
  try {
    const expiresInOneYear = 365 * 24 * 60 * 60; // seconds in 1 year
    const accessToken = createJSONWebToken(
      { _id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET_KEY,
      expiresInOneYear
    );
    console.log(accessToken);
    return accessToken;
  } catch (error) {
    console.error("Error in userLogin service:", error);
    throw new Error("Error occurred while logging in user");
  }
};

const forgotPasswordService = async (email, user) => {
  try {
    const oneTimeCode =
      Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    // Prepare email for activate user
    const emailData = {
      email,
      subject: "Account Activation Email",
      html: `
          <h1>Hello, ${user.name}</h1>
          <p>Your One Time Code is <h3>${oneTimeCode}</h3> to verify your email</p>
          <small>This Code is valid for 3 minutes</small>
          `,
    };

    // Send email
    try {
      emailWithNodemailer(emailData);
    } catch (emailError) {
      console.error("Failed to send verification email", emailError);
      throw new Error("Error creating user");
    }
    //Set one time code to user
    user.oneTimeCode = oneTimeCode;
    await user.save();

    const expiresInOneHour = 36000; // seconds in 1 hour
    const accessToken = createJSONWebToken(
      { _id: user._id, email: user.email },
      process.env.JWT_SECRET_KEY,
      expiresInOneHour
    );
    console.log(accessToken);
    return accessToken;
  } catch (error) {
    console.error("Error in forgotPassword service:", error);
    throw new Error("Error occurred while logging in user");
  }
};

const verifyCodeService = async ({ user, code }) => {
  console.log("-------user--------", user);
  console.log("--------code-------", code);

  try {
    if (user.oneTimeCode === code) {
      user.oneTimeCode = "Verified";
      user.isVerified = true;
      await user.save();
      const expiresInOneYear = 365 * 24 * 60 * 60; // seconds in 1 year
      const accessToken = createJSONWebToken(
        { _id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET_KEY,
        expiresInOneYear
      );
      console.log(accessToken);

      // Set a timeout to reset oneTimeCode to null after 3 minutes
      setTimeout(async () => {
        user.oneTimeCode = null;
        await user.save();
        console.log("oneTimeCode reset to null after 3 minutes");
      }, 3 * 60 * 1000); // 3 minutes in milliseconds

      return accessToken;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error in verifyCode service:", error);
    throw new Error("Error occurred while verifying code");
  }
};

const setPasswordService = async ({ user, password }) => {
  console.log(user, password);
  try {
    if (user.oneTimeCode === "Verified") {
      user.password = password;
      await user.save();
      return true;
    } else {
      throw new Error("Error occurred while changing password");
    }
  } catch (error) {
    console.error("Error in changePassword service:", error);
    throw new Error("Error occurred while changing password");
  }
};

const changePasswordService = async ({ user, password }) => {
  try {
    if (user.oneTimeCode === "Verified") {
      user.password = password;
      await user.save();
      return true;
    } else {
      throw new Error("Error occurred while changing password");
    }
  } catch (error) {
    console.error("Error in changePassword service:", error);
    throw new Error("Error occurred while changing password");
  }
};

module.exports = {
  userRegister,
  userLogin,
  forgotPasswordService,
  verifyCodeService,
  changePasswordService,
  setPasswordService,
};
