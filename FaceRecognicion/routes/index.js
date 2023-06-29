const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureAuthenticatedAdmin, ensureAdmin } = require('../config/auth')
const User = require('../models/User')


router.get('/',(req, res ) => res.render('index'));

router.get('/backoffice',(req, res ) => res.render('backoffice'));


router.get('/admin', (req, res) => {
    User.find().then(users => {
            res.render('admin.ejs', { "users": users });
    })
});

router.get('/users/cam', ensureAuthenticated, (req, res ) => res.render('cam', {
    name: req.user.name 
}))

module.exports = router;