const mongoose = require("mongoose");

const apointmentSchema = new mongoose.Schema(
  {
    packageId: { type: String, required: false },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    status: { type: String, required: false },
    paymentStatus: { type: String, required: false },
    therapistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Therapist",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Apointment", apointmentSchema);
