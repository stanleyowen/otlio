const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tokenSchema = new Schema ({
    userId: {
        type: String,
        required: true,
    },
    token: {
        type: String,
        require: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600,
    }
},{
    timestamps: true,
})

module.exports = Token = mongoose.model('Token', tokenSchema);