var express = require('express');
var router = express.Router();
var firebase = require('firebase');
var admin = require('firebase-admin');
var request = require('request');
var yargs = require('yargs');
var database = firebase.database();

//GETS
//Register
router.get('/register', function(req, res, next) {
        res.render('register')
}); 

//Login
router.get('/login', function(req, res, next) {
    res.render('login');
}); 

//Home
router.get('/index', function(req, res, next) {
    res.render('index');
}); 

//Reserve
router.get('/reserve', function(req, res, next) {
    var user = firebase.auth().currentUser;
    if (user) {
        res.render('reserve')
    } else {
        res.render('login', {
            error: 'You must be logged in to access this page'
        });
    }
}); 

//Bookings
router.get('/bookings', function(req, res, next) {
    var user = firebase.auth().currentUser;
    if (user) {
        res.render('bookings')
    } else {
        res.render('login', {
            error: 'You must be logged in to access this page'
        });
    }
});

//Logout
router.get('/logout', function(req, res, next) {
    var user = firebase.auth().currentUser;
    if (user) {
        res.render('logout');
    } else {
        res.render('login', {
           error: 'You are not logged in'
           });
    }
});


//POSTS
router.post('/logout', function(req, res, next) {
    firebase.auth().signOut().then(function() {
    res.redirect('/');
    }).catch(function(error) {
        console.log(error);
    });
});

router.post('/reserve', function(req, res, next) {  
    var theme = req.body.theme;
    var date = req.body.date;
    var time = req.body.time;
    var place = req.body.place;
    var lat = req.body.lat;
    var long = req.body.long;
    
    //VALIDATION
    req.checkBody('theme', 'Theme is required').notEmpty();
    req.checkBody('date', 'Date is required').notEmpty();
    req.checkBody('time', 'Time is required').notEmpty();
    req.checkBody('place', 'Restaurant is required').notEmpty();
    req.checkBody('lat', 'Choose location from the autocompleted list').notEmpty();
    req.checkBody('long').notEmpty();
    
    var errors = req.validationErrors();
    
    if(errors){
        res.render('reserve', {
            errors:errors
        });
    } else{
        var newPostKey = database.ref().child('Debates').push().key;
         database.ref('Debates/' + newPostKey).set({
             placeName: place,
             theme: theme,
             date: date,
             time: time,
             numberOfParticipants: 1,
             id: newPostKey,
             placeLong: long,
             placeLat: lat
         });
        database.ref('Debates/' + newPostKey + '/participants').set({
             0: firebase.auth().currentUser.uid
         });
        res.redirect('bookings');
        req.flash('success_msg', 'Your booking was successfull');
    }
});

router.post('/login', function(req, res, next) {
   var email = req.body.email;
    var password = req.body.password;
    
    //VALIDATION
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('password', 'Password is required').notEmpty();
    
    var errors = req.validationErrors();
    
    if(errors){
        res.render('login', {
            errors:errors
        });
    } else{       
        
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                res.redirect('index');
            } else {
                //res.redirect('login');
            }
        });
        
        firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
            var errorMessage = error.message;
            if(errorMessage){
                console.log(errorMessage);
                return res.render('login', {
                 errorMessage: errorMessage
                });
            } 
        });
    }
});

router.post('/register', function(req, res, next) {
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;
    var password2 = req.body.password2;
    
    //VALIDATION:
    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password );
    
    var errors = req.validationErrors();
    
    if(errors){
        res.render('register', {
            errors:errors
        });
    } else{
        admin.auth().createUser({
        email: email,
        emailVerified: false,
        password: password,
        displayName: name,
        disabled: false
    })
  .then(function(userRecord) {
            var uid = userRecord.uid;
            database.ref('users/' + uid).set({
            name: name,
            email: email
        });
            firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                res.redirect('index');
            } else {
                //res.redirect('login');
            }
        });
        
            firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error){
        // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                if(errorMessage){
                    console.log(errorMessage);
                    return res.render('login', {
                    errorMessage: errorMessage
                });
            } 
        });
    req.flash('success_msg', 'Registration succesfull. You are now logged in.');
    //console.log("Successfully created new user:", userRecord.uid);
  })
  .catch(function(error) {
    var errorCode = error.code;
    var errorMessage = error.message;
    if(errorMessage){
        console.log(errorMessage);
        return res.render('register', {
        errorMessage: errorMessage
        });
    } 
  });   

    }
});


module.exports = router;
