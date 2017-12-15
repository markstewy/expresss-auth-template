https://www.youtube.com/watch?v=f4F0brwbYKg

1) 'npm install jsonwebtoken passport passport-jwt bcrypt morgan --save'


    add to app.js
    ======== app.js =======
    //PASSPORT
    const morgan = require('morgan'); //used to log requests in console
    const passport = require('passport');
    const jwt = require('jsonwebtoken');
    app.use(bodyParser.urlencoded({extended: false }));
    app.use(morgan('dev'));
    ======================


2) create a config folder and add main.js and passport.js and update the app.js by importing the main.js

    ======== main.js ======
    module.exports = {
        'secret': 'somereallylongtopsecrectkeyyoumake',
        'database': 'mongodb://localhost/starwars'
    };
    ======================

    ======== app.js =======
    //PASSPORT
    const morgan = require('morgan'); //used to log requests in console
    const passport = require('passport');
    const config = require('./config/main')
    const jwt = require('jsonwebtoken');
    app.use(bodyParser.urlencoded({extended: false }));
    app.use(morgan('dev'));
    ======================

        replace

        const db = mongoose.connect('mongodb://localhost/starwars'); //specify the db name you want to connect to

        with

        const db = mongoose.connect(config.database); //specify the db name you want to connect to

        (will have to move config declaration up above the mongoose connect method so it's not undefined)

3) create a new userModel.js in the models folder

    ======== userModel.js =======

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
            bcrypt.genSalt(10, function(err, salt) {
                if (err) {
                    return next(err);
                }
                bcrypt.hash(user.password, salt, function(err, hash) {
                    if (err) {
                        return next(err);
                    }
                    user.password = hash;
                    next();
                });
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

    module.exports = mongoose.model('User', UserSchema);
======================

4) add to the passport.js
    ======== passport.js ========
    const JwtStrategy = require('passport-jwt').Strategy;
    const ExtractJwt = require('passport-jwt').ExtractJwt;
    const User = require('../models/user');
    const config = require('../config/main');


    module.exports = function(passport) {
        let opts = {};
        opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
        opts.secretOrKey = config.secret;
        passpot.use(new JwtStrategy(opts, function(jwt_payload, done) {
            User.findOne({id: jwt_payload.id}, function(err, user) {
                if (err) {
                    return done(err, false);
                }
                if (user) {
                    done(null, user);
                } else {
                    done(null, false);
                }
            });
        }));
    };
    ======================

5) add
    const User = require('./models/userModel')
    &
    app.use(passport.initialize());
    require('./config/passport')(passport);


    ========= app.js ===========
    //MONGOOSE
    const config = require('./config/main');
    const mongoose = require('mongoose');
    const db = mongoose.connect(config.database); //specify the db name you want to connect to
    const People = require('./models/peopleModel');
    const User = require('./models/userModel')

    //PASSPORT
    const morgan = require('morgan'); //used to log requests in console
    const passport = require('passport');
    const jwt = require('jsonwebtoken');
    app.use(bodyParser.urlencoded({extended: false }));
    app.use(morgan('dev'));
    app.use(passport.initialize());
    require('./config/passport')(passport);


6) add a register endpoint to app.js

    ========== app.js =========
    // EXPRESS POST REGISTER
    router.route('/register')
    .post(function(req, res) {
        if (!req.body || !req.body.password) {
            res.json({success: false, message: 'Please enter an email and password to register.'});
        } else {
            const newUser = new User({    //this enforces the schema
                email: req.body.email,
                password: req.body.password
            });
        }
        People.create(newUser, function(err, result) {
            if (err) {
                return res.json({success: false, message: 'You already have an account with this email, please login.'});
            } else {
                res.json({success: true, message: "Account created."});
            }
        });
    });  
    ===========================

7) add sign in endpoint in app.js
    ========== app.js =========





nodemailer
config npm




