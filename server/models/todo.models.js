const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const todoSchema = new Schema ({
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 6,
        maxlength: 40,
    },
    title: {
        type: String,
        required: true,
        maxlength: 40,
    },
    lebel : {
        type: String,
        required: true,
        maxlength: 20,
    },
    description: {
        type: String,
        maxlength: 120,
    },
    date: {
        type: Date,
        required: true,
        maxlength: 10,
    }
}, {
    timestamps: true
});

const Exercise = mongoose.model('todo', todoSchema);
module.exports = Exercise;