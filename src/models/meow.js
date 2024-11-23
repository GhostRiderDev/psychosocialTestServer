// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const meowSchema = new mongoose.Schema({
//     title1: { type: String, required: false },
//     title2: { type: String, required: false },
//     title1image: { type: String, required: false },
//     title2image: { type: String, required: false },
// },
//     { timestamps: true },
// );

// module.exports = mongoose.model('Meow', meowSchema);


const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const meowSchema = new mongoose.Schema({
    title1: { type: String, required: false },
    title2: { type: String, required: false },
    title1image: { type: String, required: false },
    title2image: { type: String, required: false },
},
    { timestamps: true },
);

module.exports = mongoose.model('Meow', meowSchema);

// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const meowSchema = new mongoose.Schema(
//     {
//         // Define other static fields here if needed
//         dynamicFields: { type: mongoose.Schema.Types.Mixed } // Store dynamic fields as key-value pairs
//     },
//     { timestamps: true }
// );

// module.exports = mongoose.model('Meow', meowSchema);


// const Meow = require('./meowModel');

// const newMeow = new Meow({
//     dynamicFields: {
//         title1: 'Some title',
//         title2: 'Another title',
//         title3: 'Yet another title'
//         // Add more dynamic fields as needed
//     }
// });

// newMeow.save()
//     .then(meow => {
//         console.log('Meow saved:', meow);
//     })
//     .catch(error => {
//         console.error('Error saving meow:', error);
//     });
