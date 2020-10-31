const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
SALT_WORK_FACTOR = 10;

const Schema = mongoose.Schema;

const userSchema = new Schema ({
    username : {
        type: String,
        unique: true,
        trim: true,
        required: true,
        minlength: 5
    },
    password : {
        type: String,
        required: true
    },
    token : {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

userSchema.pre('save', function(next) {
    var user = this;
    if(!user.isModified('password')) return next();
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if(err) return next(err);
        bcrypt.hash(user.password, salt, function(err, hash) {
            if(err) return next(err);
            user.password = hash;
            next();
        })
    })
})

userSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if(err) return cb(err);
        cb(null, isMatch);
    })
}

const User = mongoose.model('users', userSchema);
module.exports = User;