var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
require("dotenv").config();
const cors = require("cors");
var logger = require("morgan");
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("../documentation/swagger-doc.json");
//import routes
const userRouter = require("./routes/userRouter");
const selectTherapyRouter = require("./routes/SelectTherapyRouter");
const serveyRouter = require("./routes/serveyRouter");
const packageRouter = require("./routes/PackageRouter");
const appointmentRouter = require("./routes/apointmentRouter");
const therapistRouter = require("./routes/therapistRouter");
const sheiduleRouter = require("./routes/sheiduleRouter");
const timeSheiduleRouter = require("./routes/timeSceiduleRouter");
const answerRouter = require("./routes/answerRouter");
const subscriptionPlanRouter = require("./routes/subscriptionPlanRouter");
const messageRoouter = require("./routes/messageRouter");
const ratingRouter = require("./routes/ratingRouter");
const notificationRouter = require("./routes/notificationRouter");
// test api route
const multipleImageRouter = require("./routes/multipleUploadRouter");
//helper function
const { connectToDatabase } = require("./helpers/connection");
const validateResponse = require("./middlewares.js/validator");

// Import models
const Sheidule = require("./models/Sheidule");
const Notification = require("./models/Notification");

var app = express();

//DB connection
connectToDatabase();

// Enable CORS
app.use(
  cors({
    origin: "*",
    optionsSuccessStatus: 200,
  })
);

// app.use(validateResponse);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/public", express.static(__dirname + "/public"));

//Routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/therapy", selectTherapyRouter);
app.use("/api/v1/servey", serveyRouter);
app.use("/api/v1/package", packageRouter);
app.use("/api/v1/apointment", appointmentRouter);
app.use("/api/v1/therapist", therapistRouter);
app.use("/api/v1/sheidule", sheiduleRouter);
app.use("/api/v1/time-sheidule", timeSheiduleRouter);
app.use("/api/v1/answer", answerRouter);
app.use("/api/v1/subscription", subscriptionPlanRouter);
app.use("/api/v1/message", messageRoouter);
app.use("/api/v1/rating", ratingRouter);
app.use("/api/v1/notification", notificationRouter);
//test api route
app.use("/api/v1/meowimage", multipleImageRouter);
app.use("/doc", swaggerUi.serve, swaggerUi.setup(swaggerFile));

// test route
app.get("/api/test", (req, res) => {
  res.send("I am responding!");
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    // If headers have already been sent, do nothing further
    return next("Something went wrong"); // You can choose the message you want to send.
  }

  if (error.message) {
    console.error("Error:", error.message);
    return res.status(500).send(error.message);
  } else {
    error.statusCode = error.statusCode || 500;
    error.status = error.status || "error";
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message || "There was an error!",
    });
  }
});

app.use((err, req, res, next) => {
  //console.error("error tushar",err.message);
  res.status(500).json({ message: err.message });
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(500).json({ message: err.message });
});



module.exports = app;
