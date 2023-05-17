const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')
const passport = require('passport')

const app = express()

app.use('/assets', express.static('../assets'))

//User model 
const User = require('../models/User')


router.get('/login',(req, res ) => res.render('login'))

router.get('/register',(req, res ) => res.render('register'))

router.get('/cam', (req, res) => {
    res.render("cam.ejs")
})

// Register Handle
router.post('/register', (req, res) => {
    const { name, email, password, password2} = req.body;
    let errors = [];

    if(!name || !email || !password || !password2) {
        errors.push({ msg: 'Please fill in all fields'});
    }

    if(password !== password2) {
        errors.push({ msg: 'Passwords do not match '});
    }

    if(password.length < 6) {
        errors.push({msg: 'Password should be at least 6 characters'});
    }

    console.log(errors);

    if(errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        })
    } else {
        //Validation passed
        User.findOne({email: email})
            .then(user => {
                if(user) {
                    //User Existes
                    errors.push({ msg: 'Email is already registered'})
                    res.render('register', {
                        errors,
                        name,
                        email,
                        password,
                        password2
                    });
                } else {
                    const newUser = new User({
                        name,
                        email,
                        password
                    });

                    bcrypt.genSalt(10, (err,salt) =>
                        bcrypt.hash(newUser.password, salt, (err,hash) => {
                            if(err) throw err;
                            // Set pasword to hashed
                            newUser.password = hash; 
                            // Save user
                            newUser.save()
                            .then(user =>{
                                req.flash('success_msg', 'You are now registered')
                                res.redirect('login');
                            })
                            .catch(err => console.log(err));
                        }))
                }
        });
    }
})

// Login Handle
router.post('/register', (req, res, next) => {
    passport.authenticate('local', {
      successRedirect: 'cam',
      failureRedirect: 'login',
      failureFlash: true
    })(req, res, next);
  });
  

module.exports = router;