const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Please add a note title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters'],
        default: 'Untitled Note'
    },
    content: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Note', noteSchema);
