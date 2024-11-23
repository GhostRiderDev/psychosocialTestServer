const { mongoose } = require("mongoose");

const ratingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    therapistId: { type: mongoose.Schema.Types.ObjectId, required: true },
    rating: { type: Number, required: true },
},
    { timestamps: true },
);

module.exports = mongoose.model('Rating', ratingSchema);