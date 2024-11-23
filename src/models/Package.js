const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
    name: { type: String, required: true, enum: ['Messaging Therapy', 'Messaging +1 Session', 'Messaging +4 Session',], default: "Messaging Therapy" },
    price: { type: String, required: false, },
    description: { type: Array, required: false },
},
    { timestamps: true },
);

module.exports = mongoose.model('Package', packageSchema);