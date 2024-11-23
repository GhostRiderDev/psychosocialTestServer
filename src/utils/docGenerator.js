const swaggerAutogen = require("swagger-autogen")();

const outputFile = "../../documentation/swagger-doc.json";
const endpointsFiles = [
  "../routes/answerRouter.js",
  "../routes/apointmentRouter.js",
  "../routes/messageRouter.js",
  "../routes/multipleUploadRouter.js",
  "../routes/notificationRouter.js",
  "../routes/packageRouter.js",
  "../routes/ratingRouter.js",
  "../routes/SelectTherapyRouter.js",
  "../routes/serveyRouter.js",
  "../routes/sheiduleRouter.js",
  "../routes/subscriptionPlanRouter.js",
  "../routes/therapistRouter.js",
  "../routes/timeSceiduleRouter.js",
  "../routes/userRouter.js",
];

swaggerAutogen(outputFile, endpointsFiles);
