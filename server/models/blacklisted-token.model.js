const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const blacklistedTokenSchema = new Schema ({
    userId: {
        type: String,
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '1d'
    }
}, {
    timestamps: true,
})

module.exports = User = mongoose.model('blacklisted-token', blacklistedTokenSchema);