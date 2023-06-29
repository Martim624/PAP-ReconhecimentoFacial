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
  
router.get('/action', (req,res,next) => {
    users.exec( (err,data) => {
      if(err) throw err;
  
      res.render('edit-delete-data', {title: 'Action', records: data});
    });
  });

router.get('/edit/:id', (req, res, next) => {
    console.log(req.params.id);
    var id = req.params.id;
    var edit = User.findById(id).exec(); // Remove the callback function
  
    // render file
    edit.then((data) => {
      res.render('edit', { title: 'Edit form', user: data });
    })
    .catch((err) => {
      console.error(err);
      next(err);
    })
  });

  router.post('/update/', (req, res, next) => {
    var update = User.findByIdAndUpdate(req.params.id, {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      role: req.body.role,
    });
  
    update
      .then(() => {
        res.redirect('/action/');
      })
      .catch((err) => {
        console.error(err);
        next(err);
      });
  });

  
module.exports = router;


/*
outer.post('/update/', (req,res,next) => {
    var update = User.findByIdAndUpdate(req.params.id, {
      name: req.params.name,
      email: req.params.email,
      password: req.params.password,
      role: req.params.role,
      date: req.params.date,
    });
  
    update.exec( (err,data) => {
      if(err) throw err;
  
      res.redirect('/action/');
    })
  });
  });
  
  
  // Route for dalete data 
  router.get('/delete/:id', (req,res, next) => {
    var id = req.params.id;
    var del = User.findByIdAndDelete(id);
  
    // render file
    del.exec( (err, data) => {
      if(err) throw err;
      res.redirect('/action');
      

      */