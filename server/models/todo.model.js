const mongoose = require('mongoose')
const Schema = mongoose.Schema

const todoSchema = new Schema ({
    email: {
        type: String,
        trim: true,
        required: true,
        minlength: 6,
        maxlength: 60
    },
    title: {
        data: {
            type: String,
            required: true
        }, iv: {
            type: String,
            required: true,
            minlength: 32,
            maxlength: 32
        }
    },
    label: {
        data: {
            type: String,
            required: true
        }, iv: {
            type: String,
            required: true,
            minlength: 32,
            maxlength: 32
        }
    },
    description: {
        data: { type: String },
        iv: { type: String }
    },
    date: {
        data: {
            type: String,
            required: true
        }, iv: {
            type: String,
            required: true,
            minlength: 32,
            maxlength: 32
        }
    },
    index: {
        type: Number,
        required: true,
        default: 0
    }
}, { timestamps: true })

const Todo = mongoose.model('todo', todoSchema)
module.exports = Todo