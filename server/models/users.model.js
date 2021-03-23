const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema ({
    email : {
        type: String,
        unique: true,
        trim: true,
        required: true,
        minlength: 6,
        maxlength: 40,
    },
    password : {
        type: String,
        maxlength: 60,
    },
    thirdParty: {
        isThirdParty: {
            type: Boolean,
            default: false,
        }, provider: {
            type: String,
            default: null,
            maxlength: 10,
        }, status: {
            type: String,
            default: null,
            maxlength: 10,
        }
    },
}, {
    timestamps: true
});

module.exports = User = mongoose.model('users', userSchema);