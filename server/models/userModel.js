const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        lowercase: true,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['Client', 'Manager', 'Associate', 'Admin'],
        default: 'Client'
    }
});

//hash pswrd before saving
userSchema.pre('save', function(next) {
    let user = this;
    if (this.isModified('password') || this.isNew) {
            bcrypt.hash(user.password, 10, function(err, hash) {
                if (err) {
                    return next(err);
                }
                user.password = hash;
                next();
            });
    } else {
        return next();
    }
});

userSchema.methods.comparePassword = function(pw, cb) {
    bcrypt.compare(pw, this.password, function(err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};

const userModel = mongoose.model('User', userSchema, 'users'); //!!!!!! third param 'people' specifies associated collection name in mongodb !!!!!!!!
module.exports = userModel;