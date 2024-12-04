const mongoose = require("mongoose");

const timeSheiduleSchema = new mongoose.Schema({
  therapistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Therapist",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  duration: {
    type: Number, // in minutes
    required: true,
    enum: [30, 60], // Allow only 30 or 60 minute slots
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("TimeSceidule", timeSheiduleSchema);
