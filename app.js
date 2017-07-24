var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var stylus = require('stylus');
var hbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');
var firebase = require("firebase");
var admin = require("firebase-admin");
var request = require('request');

//Firebase Init
var config = {
    apiKey: "AIzaSyDZUABz1fhOlKQo9Jv0cSylGXCVXQeM_as",
    authDomain: "chatapp-ed83f.firebaseapp.com",
    databaseURL: "https://chatapp-ed83f.firebaseio.com",
    storageBucket: "chatapp-ed83f.appspot.com",
};
firebase.initializeApp(config);
var database = firebase.database();

var serviceAccount = require(__dirname + "/Tab Apetit.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://chatapp-ed83f.firebaseio.com"
});

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.engine('hbs', hbs({
    extname: 'hbs',
    defaultLayout: 'layout',
    layoutsDir: __dirname + '/views'
}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(stylus.middleware(path.join(__dirname, 'public')));

//Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Express session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

// In this example, the formParam value is going to get morphed into form body format useful for printing.
// Express Validator
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.'),
            root = namespace.shift(),
            formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

//Connect Flash
app.use(flash());

//Passport 
app.use(passport.initialize());
app.use(passport.session());

//Global Vars
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

//  MAYBE UNCOMMENT
//app.set('port', (process.env.PORT || 3000));
//app.listen(app.get('port'), function(){
//    console.log('Server started on port '+app.get('port'));
//});

module.exports = app;
