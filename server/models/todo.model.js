const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const todoSchema = new Schema ({
    email: {
        type: String,
        trim: true,
        required: true,
        minlength: 6,
        maxlength: 40,
    },
    title: {
        data: {
            type: String,
            required: true,
        }, iv: {
            type: String,
            required: true,
        }
    },
    label: {
        data: {
            type: String,
            required: true
        }, iv: {
            type: String,
            required: true
        }
    },
    description: {
        data: {
            type: String
        }, iv: {
            type: String
        }
    },
    date: {
        data: {
            type: String,
            required: true,
        }, iv: {
            type: String,
            required: true,
        }
    }
}, {
    timestamps: true
});

const Exercise = mongoose.model('todo', todoSchema);
module.exports = Exercise;