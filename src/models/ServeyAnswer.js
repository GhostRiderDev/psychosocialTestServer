const mongoose = require('mongoose');

const serveyAnswerSchema = new mongoose.Schema({
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    options: { type: Array, required: false },
    correctAnswers: { type: Array, required: false },
},
    { timestamps: true },
);

module.exports = mongoose.model('ServeyAnswer', serveyAnswerSchema);