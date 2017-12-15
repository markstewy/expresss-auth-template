const path = require('path');
cors = require('cors');
const bodyParser = require('body-parser');
const express = require('express');

//EXPRESS
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false }));
//comment out static vvvvv line when trying to hit end points from somewhere besides your static files
// app.use(express.static(path.join(__dirname, '../public')));

//MONGOOSE
const mongoose = require('mongoose');
const config = require('./config/main');
const db = mongoose.connect(config.database); //specify the db name you want to connect to
//mongoose models
const People = require('./models/peopleModel');
const User = require('./models/userModel');

//PASSPORT
const passport = require('passport');
const jwt = require('jsonwebtoken');
app.use(passport.initialize());
require('./config/passport')(passport);
// const morgan = require('morgan'); //used to log requests in console
// app.use(morgan('dev'));

//Simple Non Router endpoint starter
// app.get('/', function(req, res) {
//     res.send({'myapi': "i hear you!"});
// })

//ROUTER
const router = express.Router();
app.use('/', router);

// EXPRESS GET endpoint1 - NO Callback using req.params & req.query          http://localhost:8080/peopleAPI1/male?birth_year=19BBY   (should return luke)   
router.route('/peopleAPI1/:gender') 
    .get(function(req, res) {  
        // MONGOOSE
        let results = People.find(req.params)
            .where(req.query);
            //---manipulate results here-----
                // results.select(name: "Mark"); //or any other mongoose query method ie (.sort, .limit etc.)
                //  or use pure javascript to perform calculations that you don't want visible on the front end
                //  you might calculate and get a yes/no answer and simply use a res.send 
        results.exec(function(err,data) {
            if (err) {
                res.status(500).send(err);
            } else {
                res.json(data);
            }
        })
    })
// EXPRESS GET endpoint2 - No Callback using req.params and req.query with mongoose comparison operators         http://localhost:8080/peopleAPI2/150/170?gender=male 
router.route('/peopleAPI2/:heightMin/:heightMax')
    .get(function(req, res) {
        //MONGOOSE
        let results = People.find(
                {   
                    height: { $gt: req.params.heightMin, $lt: req.params.heightMax }
                }
            )
            .where(req.query);

        results.exec(function(err,data) {
            if (err) {
                res.status(500).send(err);
            } else {
                res.json(data);
            }
        })
    })
// EXPRESS GET endpoint3 - Callback using req.query (no req.params)        http://localhost:8080/peopleAPI3?gender=female 
router.route('/peopleAPI3')
    .get(function(req, res) {  
        //MONGOOSE
        People.find(
            req.query, 
            function(err, data) { 
                if (err) {
                    res.status(500).send(err);
                } else {
                    res.json(data);
                }
            }
        )
    })
// EXPRESS POST endpoint4
router.route('/peopleAPI4')
    .post(function(req, res) {
        People.create(req.body, function(err, result) {
            if (err) {
                return res.status(500).send(err);
            } else {
                res.status(200).json(result);
            }
        })
    });
// EXPRESS DELETE endpoint5
router.route('/peopleAPI5/:id')
    .delete(function(req, res) {
        People.findByIdAndRemove(req.params.id, function(err, result) {
            if (err) {
                return res.status(500).send(err);
            } else {
                res.status(200).json(result);
            }
        })
    });
// EXPRESS PUT endpoint5
router.route('/peopleAPI6/:id')
    .put(function(req, res) {


        People.findById(req.params.id, function (err, target) {
            if (err) {
                return res.status(500).send(err);
            } else {
                target.set(req.body);
                target.save(function (err, updatedTarget) {
                  if (err) return handleError(err);
                  res.send(updatedTarget);
                });
            }
          });
    })
//REGISTER NEW ACCOUNT
router.route('/register')
.post(function(req, res) {
    if (!req.body || !req.body.password) {
        res.json({success: false, message: 'Please enter an email and password to register.'});
    } else {
        const newUser = new User({    //use user schema to enforce type on incoming data
            email: req.body.email,
            password: req.body.password
        });
        User.create(newUser, function(err, result) {
            if (err) {
                return res.json({success: false, message: 'You already have an account with this email, please login.'});
            } else {
                res.json({success: true, message: "Account created."});
            }
        });
    }
});   
// AUTHENTICATE/SIGNIN and get a JWT
router.route('/authenticate')
.post(function(req, res) {
    User.findOne({
        email: req.body.email
    }, function(err, user) {
        if (err) throw err;
        if (!user) {
            res.send({success: false, message: 'Authentication failed. User not found.'});
        } else {
            user.comparePassword(req.body.password, function(err, isMatch) {
                if (isMatch && !err) {
                    const token = jwt.sign(user.toJSON(), config.secret, {
                        expiresIn: (60 * 60)
                    });
                    res.json({success: true, token: token});
                } else {
                    res.send({success: false, message: 'Authentication failed. Incorrect Password.'});
                }
            });
        }
    })
});    
// EXPRESS GET CHECK AUTH and user Role
router.route('/peopleCheckAuth') 
.get(passport.authenticate('jwt', {session: false}), function(req, res) {  
    if (req.user.role === 'Client') {
        let results = People.find()
        results.exec(function(err,data) {
            if (err) {
                res.status(500).send(err);
            } else {
                res.json(data);
            }
        });
    } else {
        res.send('Isufficient Permissions');
    }

});

let port = 8080;
app.listen(port, function() {
    console.log('express is running on port ' + port);
});