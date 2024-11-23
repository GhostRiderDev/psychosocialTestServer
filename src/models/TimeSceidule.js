const mongoose = require('mongoose');

const timeSceiduleSchema = new mongoose.Schema({
    sheidule: { type: Date, required: true },
    name: { type: String, required: false },
},
    { timestamps: true },
);

module.exports = mongoose.model('TimeSceidule', timeSceiduleSchema);