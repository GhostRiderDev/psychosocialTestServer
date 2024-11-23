const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema({
    title: {
        type: String,
        required: false
    },
    price: {
        type: Number,
        required: true
    },
    sessionCount: {
        type: Number,
        required: false
    },
    planType: {
        type: String,
        enum: ["Individual and Teen", "Couple"],
        default: "Individual and Teen"
    },
    duration: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: false
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);