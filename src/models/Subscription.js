const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plan',
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    sessionCount: {
        type: Number,
    },
    duaration: {
        type: Number,
    },
    payment: {
        type: String,
        required: true,
        enum: ["Paid", "Unpaid", "Trail"], // Enum values
        default: "Unpaid" // Default value if not provided
    },
    price: { type: Number, required: true },
    status: { type: String, required: true, enum: ["Active", "Inactive"], default: "Active" },
    trasactionId: { type: String, required: false }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Subscription', subscriptionSchema);