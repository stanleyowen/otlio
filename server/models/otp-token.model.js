const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tokenSchema = new Schema ({
    ipAddr: {
        type: String,
        required: true
    },
    userId: {
        data: {
            type: String,
            required: true
        }, iv: {
            type: String,
            required: true
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
        expires: 300
    }
},{
    timestamps: true
})

module.exports = OTPToken = mongoose.model('OTP-Token', tokenSchema);