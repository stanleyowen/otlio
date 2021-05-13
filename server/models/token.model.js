const mongoose = require('mongoose')
const Schema = mongoose.Schema

const tokenSchema = new Schema ({
    type: {
        passwordReset: {
            type: Boolean,
            default: false,
            required: true
        }, accountVerification: {
            type: Boolean,
            default: false,
            required: true
        }
    },
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
            required: true
        }, iv: {
            type: String,
            required: true
        }
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600
    }
},{ timestamps: true })

module.exports = Token = mongoose.model('token', tokenSchema)