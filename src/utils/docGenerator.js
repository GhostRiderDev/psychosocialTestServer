const swaggerAutogen = require("swagger-autogen")();

const outputFile = "../../documentation/swagger-doc.json";
const endpointFile = ["../app.js"];

swaggerAutogen(outputFile, endpointFile, {
  info: {
    version: "1.0.0",
    title: "Psychosocial App API",
    description: "API Documentation for Psychosocial test App",
  },
  host: "localhost:3000",
  schemes: ["http", "https"],
  consumes: ["application/json", "multipart/form-data"],
  produces: ["application/json"],
  tags: [
    { name: "Answer", description: "Endpoints relacionados con respuestas" },
    { name: "Appointment", description: "Endpoints relacionados con citas" },
    { name: "Message", description: "Endpoints relacionados con mensajes" },
    {
      name: "MultipleUpload",
      description: "Endpoints relacionados con múltiples subidas",
    },
    {
      name: "Notification",
      description: "Endpoints relacionados con notificaciones",
    },
    { name: "Package", description: "Endpoints relacionados con paquetes" },
    {
      name: "Rating",
      description: "Endpoints relacionados con calificaciones",
    },
    {
      name: "SelectTherapy",
      description: "Endpoints relacionados con selección de terapia",
    },
    { name: "Servey", description: "Endpoints relacionados con encuestas" },
    { name: "Sheidule", description: "Endpoints relacionados con horarios" },
    {
      name: "SubscriptionPlan",
      description: "Endpoints relacionados con planes de suscripción",
    },
    { name: "Therapist", description: "Endpoints relacionados con terapeutas" },
    {
      name: "TimeSceidule",
      description: "Endpoints relacionados con horarios de tiempo",
    },
    { name: "User", description: "Endpoints relacionados con usuarios" },
  ],
});
