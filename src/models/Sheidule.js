const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const sheiduleSchema = new mongoose.Schema({
    date: { type: String, required: [true, "Data is required"], minlength: 3, maxlength: 30, },
    time: { type: Array, required: [true, "Time is required"] },
    therapistId: { type: mongoose.Schema.Types.ObjectId, ref: "Therapist", required: true },
    completed: { type: Boolean, default: false },
    isBooked: { type: Boolean, default: false },
    // bookingType: { type: String, enum: ["Video", "Audio", "Message"], default: "Message", required: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    therapistPayment: { type: Number, required: false }
},
    { timestamps: true },
);

module.exports = mongoose.model('Sheidule', sheiduleSchema);