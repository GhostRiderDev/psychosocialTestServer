const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const selectTherapySchema = new mongoose.Schema({
    theherapiName: { type: String, required: true, enum: ["Individual", "Couple Therapy", "Teen Therapy"], default: "Individual" },
    therapiDescription: { type: String, required: false, minlength: 3, maxlength: 30, },
    therapyPrice: { type: Number, required: false, minlength: 3, maxlength: 30, },
    therapyDuration: { type: Number, required: false, minlength: 3, maxlength: 30, },
    patientId: { type: String, required: false },
},
    { timestamps: true },
);

module.exports = mongoose.model('SelectTherapy', selectTherapySchema);