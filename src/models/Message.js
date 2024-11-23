const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const messageSchema = new mongoose.Schema({
    chatId: { type: mongoose.Schema.Types.ObjectId, required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, required: true },
    participant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: false },
    publicFileURL: { type: String, required: false },
    path: { type: String, required: false },
    sendTime: { type: String, required: true },
    messageType: {
        type: String,
        enum: ['text', 'image', 'audio', 'text/image'], // Define allowed values
        default: 'text',
        required: false
    }
},
    { timestamps: true },
);

module.exports = mongoose.model('Message', messageSchema);