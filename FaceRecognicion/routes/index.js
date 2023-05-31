const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth')

router.get('/',(req, res ) => res.render('index'));

router.get('/users/cam', ensureAuthenticated, (req, res ) => res.render('cam', {
    name: req.user.name 
}))

module.exports = router;