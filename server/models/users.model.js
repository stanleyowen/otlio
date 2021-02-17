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
        required: true,
        minlength: 6,
        maxlength: 60,
    },
    referral_code : {
        type: String,
        default: function() {
            let hash = 0;
            for (let i = 0; i < this.email.length; i++){
                hash = this.email.charCodeAt(i) + ((hash << 5) - hash)
            }
            let res = (hash & 0x00ffffff).toString(16).toUpperCase();
            return "00000".substring(0,6 - res.length) + res;
        }
    },
    referred_by: {
        type: String,
        default: null,
    }
}, {
    timestamps: true
});

module.exports = User = mongoose.model('users', userSchema);