const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tokenSchema = new Schema ({
    ipAddr: {
        type: String,
        required: true
    },
    type: {
        passwordReset: {
            type: Boolean,
            default: false,
            require: true
        }, accountVerification: {
            type: Boolean,
            default: false,
            require: true
        }
    },
    userId: {
        data: {
            type: String,
            require: true
        }, iv: {
            type: String,
            require: true
        }
    },
    token: {
        data: {
            type: String,
            require: true
        }, iv: {
            type: String,
            require: true
        }
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600
    }
},{
    timestamps: true
})

module.exports = Token = mongoose.model('Token', tokenSchema);