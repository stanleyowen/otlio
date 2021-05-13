const mongoose = require('mongoose')
const Schema = mongoose.Schema

const tokenSchema = new Schema ({
    userId: {
        data: {
            type: String,
            required: true,
            minlength: 64,
            maxlength: 64
        }, iv: {
            type: String,
            required: true,
            minlength: 32,
            maxlength: 32
        }
    },
    token: {
        data: {
            type: String,
            required: true,
            minlength: 32,
            maxlength: 32
        }, iv: {
            type: String,
            required: true,
            minlength: 32,
            maxlength: 32
        }
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300 // 5 minutes
    }
},{ timestamps: true })

module.exports = OTPToken = mongoose.model('otp-token', tokenSchema)