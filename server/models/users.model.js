const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema ({
    email : {
        type: String,
        unique: true,
        trim: true,
        required: true,
        minlength: 6,
        maxlength: 60
    },
    password : {
        type: String,
        maxlength: 60
    },
    thirdParty: {
        isThirdParty: {
            type: Boolean,
            default: false,
            required: true
        }, google: {
            type: Boolean,
            default: false,
            required: true
        }, github: {
            type: Boolean,
            default: false,
            required: true
        }, verified: {
            type: Boolean,
            default: false,
            required: true
        }
    },
    verified: {
        type: Boolean,
        default: false,
        required: true
    },
    security: {
        '2FA' : {
            type: Boolean,
            default: false,
            required: true
        }, 'backup-codes': {
            valid: [{ type: Object }],
            invalid: [{ type: Object }]
        }
    }
}, { timestamps: true })

module.exports = User = mongoose.model('users', userSchema)