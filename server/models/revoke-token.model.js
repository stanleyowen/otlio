const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const blacklistedTokenSchema = new Schema ({
    userId: {
        type: String,
        required: true
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
        expires: '1d'
    }
}, {
    timestamps: true
})

module.exports = User = mongoose.model('revoked-token', blacklistedTokenSchema);