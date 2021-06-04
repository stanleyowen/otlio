const mongoose = require('mongoose')
const Schema = mongoose.Schema

const blacklistedTokenSchema = new Schema ({
    userId: {
        type: String,
        required: true,
        minlength: 24,
        maxlength: 24
    },
    token: {
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
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '1d'
    }
}, { timestamps: true })

module.exports = User = mongoose.model('revoked-token', blacklistedTokenSchema)