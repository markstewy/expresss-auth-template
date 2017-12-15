**STEP 1 - SETUP**
`npm intall express mongoose --save`

=========== ExpressPractice1/server/app.js ===========

var express = require('express');
var app = express();
var port = 8080;
app.listen(port, function() {
    console.log('express is running on port ' + port);
})
======================================================

`npm run app.js`


**STEP 2A STATIC FILES**

app.use(express.static('filepath to folder you want served));

=========== ExpressPractice1/server/app.js ===========

var express = require('express');
var app = express();
app.use(express.static('/Users/markstewart/Dev/Expresss/ExpressStarter/public'));
var port = 8080;
app.listen(port, function() {
    console.log('express is running on port ' + port);
})
======================================================

you can create an html file or png file and save it in the public folder and access it by hitting the URL:

`localhost:8080/index.html`
`localhost:8080/myCat.jpeg`

and you'll be able to view in the browser.


**STEP 2B STATIC FILES - __dirname and Path**

when serving static files we fun into complications involving file path changes:

    1) when building an applicaiton for production, our front end application is often times bundled and sent to a newly created folder like /dist
    2) the root path will be different when running your code on a server
    3) sometimes static files dont even need to be served (ie. when working with an angular4 application you use 'ng serve' to spin up your app) only when building for production with 'ng build' there will be a bundle of code in a newly craete /dist folder)

MAKING THE FILE PATH DYNAMIC 
    by using Node.js native functionality: 
        a) path.join
        b) __dirname

=========== ExpressPractice1/server/app.js ===========

var path = require('path');
var express = require('express');
var app = express();
app.use(express.static(path.join(__dirname, '../public')));

var port = 8080;
app.listen(port, function() {
    console.log('express is running on port ' + port);
})
======================================================

`__dirname` will always return the file path to where the variable is located (app.js in this case) 
Try `console.log(__dirname)` to see your current path

The problem is that we don't want our current path to app.js, we want a path pointing to our public folder with our static files
Update the path by using `path.join(__dirname, '../public')`
The path.join method will take as may paramenters as you want and update the file path, you can naviate up a file path with `..` as an argument.

* Remember there are 2 underscores in dirname    _ _ d i r n a m e
* If you are not serving static files (like when using ng serve and running your express app on separate port you can sipmly comment out the static file line - there are more dynamic ways to solve this problem)
* YOU WON"T BE ABLE TO HIT YOUR API FROM ANOTHER FRONT END NOT SERVRED WITH EXPRESS.STATIC UNLESS YOU COMMENT OUT THE EXPESS.STATIC LINE
* Don't try to recreate this stuff on your own - there are certain incompatability issues between macs and pcs using fwd/ or back\ slashes in file paths

**STEP 3 CORS ERROR**

CORS Error = cross origin resource error    
it is the result of having your front end make a http request to a different ip address

This can happen in development (specifically with Angular4 when you use ng serve to serve your front end on localhost:4200 but your express application isn't running) - you can't run your express application on 4200, that port is being used already, the answer is using cors to allow your front end to hit your epxress api on a different port.

    1) the solution is on the server side - we add CORS to our express application
        `npm install cors --save`
    2) require cors
        `cors = require('cors');`
    3) use cors
        `app.use(cors());`

=========== ExpressPractice1/server/app.js ===========

var path = require('path');
var express = require('express');
cors = require('cors');

var app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, '../public')));

var port = 8080;
app.listen(port, function() {
    console.log('express is running on port ' + port);
})
======================================================

* remember that you cannot hit this api from another front end if you are serving up static files, if static files are being served you can only use that to hit your http end points.


**STEP 4 SIMPLE ROUTE**

we want to use a router, but before that we'll go over a simple route to quickly return some data

=========== ExpressPractice1/server/app.js ===========

var path = require('path');
var express = require('express');
cors = require('cors');

var app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', function(req, res) {
    res.send({'myapi': "i hear you!"});
})

var port = 8080;
app.listen(port, function() {
    console.log('express is running on port ' + port);
})
======================================================

res.json will also use res.send, the difference is that res.json will convert non json objects to json so they can be sent

**STEP 5 USING EXPRESS ROUTER & MONGOOSE**

`const router = express.Router();
app.use('/', router);`

`npm install mongoose --save`

*see app.js file for router and mongoose examples with notes*

==========GET=========
*TWO API STRUCTURES*
    Send back data by:
        1) include an anonymous callback function as the second parameter in your mongoose method to return the data ie:
                    `router.route('/peopleWithCallback')
                        .get(function(req, res) {  
                            //MONGOOSE Query
                            People.find(
                                req.query,           <========= first argument in mongoose method
                                function(err, people) {       <========= second argument (anonymous callback) in mongoose method
                                    if (err) {
                                        res.status(500).send(err);
                                    } else {
                                        res.json(people);
                                    }
                                }
                            )
                        })`
        
        this structure will return the data immediately

        2)  dont incude an anonymous callback as the second paramter in mongoose method. Instead, assign queried data to a variable
            and then use the .exec() method on that variable ie:
                    `router.route('/peopleNoCallback') 
                        .get(function(req, res) {  
                            // MONGOOSE
                            var results = People.find(req.query)    <========== first and only argument in mongoose method
                                                                    <========== you can manipulate the data here!
                            results.exec(function(err,results) {    <========== when ready use the .exec() method to send data
                                if (err) {
                                    res.status(500).send(err);
                                } else {
                                    res.json(results);
                                }
                            })
                        })`
        
        this structure lets you manipulate the data before sending it back to the requester

        *remmber than params are a required field if specified in the route '/:param/:param2' but queries are optional adn won't break if no params are passed in

==========POST=========
    post needs body-parser

    `npm install --save body-parser`

    const express = require('express');
    app.use(bodyParser.json());

    