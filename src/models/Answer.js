const mongoose = require('mongoose');

// const answerSchema = new mongoose.Schema({
//     question: { type: String, required: false },
//     questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
//     answerType: { type: String, required: false, enum: ['Checkbox', 'Multiple', "Paragraph"], default: "Checkbox" },
//     answer: { type: Array, required: true },
//     userId: { type: mongoose.Schema.Types.ObjectId, required: false },
// },
//     { timestamps: true },
// );

const answerSchema = new mongoose.Schema({
    answer: { type: Array, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
},
    { timestamps: true },
);

module.exports = mongoose.model('Answer', answerSchema);