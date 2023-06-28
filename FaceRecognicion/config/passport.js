const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load User Model
const User = require('../models/User');

module.exports = function(passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'email'}, (email, password, done) => {
            // Match User
            User.findOne({email: email})
                .then(user => {
                    if(!user) {
                        return done(null, false, { message: 'That email is not registered'})
                    }

                    // Match password
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if(err) throw err;

                        if(isMatch) {
                            return done(null, user)
                        } else {
                            return done(null, false, { message: 'Password incorrect'})
                        }
                    });
                })
                .catch(err => console.log(err));
        })
    );

    passport.serializeUser(function(user, done) {
        done(null, user.id);
      });
      
      passport.deserializeUser(function(id, done) {
        User.findById(id)
          .then(user => done(null, user))
          .catch(err => done(err));
      })
    
    /*  passport.isAdmin = function(req, res, next) {
        if (req.isAuthenticated() && req.user.role === 'admin') {
            return next(); // User is admin, proceed to the next middleware
        }
        res.redirect('/backoffice'); // User is not admin, redirect to home page or any other page you want
    } */
};