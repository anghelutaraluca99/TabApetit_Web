var express = require('express');
var router = express.Router();
var firebase = require('firebase');
var admin = require('firebase-admin');
var request = require('request');
var yargs = require('yargs');
var database = firebase.database();
//Register
router.get('/register', function(req, res, next) {
    res.render('register');
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
    res.render('reserve'); 
}); 


router.post('/', function(req, res, next) {
    firebase.auth().signOut().then(function() {
        res.redirect('/');
    }).catch(function(error) {
        console.log(error);
});
})

router.post('/reserve', function(req, res, next) {
    
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
            var uid = userRecord.uid
        function writeUserData(uid, name, email) {
            firebase.database().ref('users/' + userId).set({
            username: name,
            email: email
        });
    }
    req.flash('success_msg', 'Registration succesfull. You can now log in.');               res.redirect('login');
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
