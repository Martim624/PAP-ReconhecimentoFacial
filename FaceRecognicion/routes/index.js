const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureAuthenticatedAdmin, ensureAdmin } = require('../config/auth');
const User = require('../models/User');
const bcrypt = require('bcryptjs')


router.get('/', (req, res) => res.render('index'));

router.get('/backoffice', (req, res) => res.render('backoffice', { layout: 'layout' }));

router.get('/terms-conditions', (req, res) => res.render('terms-conditions.ejs'));


router.get('/admin', ensureAdmin, (req, res) => {
  User.find().then(users => {
    res.render('admin.ejs', { "users": users });
  });
});

router.get('/users/cam', ensureAuthenticated, (req, res) => res.render('cam', {
  name: req.user.name
}));


// Action to db
router.get('/action', async (req, res, next) => {
  try {
    const users = await User.find().exec();
    res.render('admin', { title: 'Action', users: users });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// Get value from model
router.get('/add', (req, res) => {
  res.render('add', { title: 'Add User' });
});



// Add User
router.post('/add', async (req, res, next) => {
  try {
    const saltRounds = 10;
    const { name, email, password, role } = req.body;

    // Generate salt and hash the password
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });

    const savedUser = await newUser.save();
    res.redirect('/action');
  } catch (err) {
    // Handle the error in your preferred way
    throw err;
  }
});
/*router.post('/add', async (req, res, next) => {
  try {
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      role: req.body.role,
    });

    const savedUser = await newUser.save();
    console.log(savedUser);
    res.redirect('/action');
  } catch (err) {
    console.error(err);
    next(err);
  }
});*/

// Edit 
router.get('/edit/:id', (req, res, next) => {
  var id = req.params.id;
  var edit = User.findById(id).exec();

  // render file
  edit.then((data) => {
    res.render('edit', { title: 'Edit form', user: data });
  })
    .catch((err) => {
      console.error(err);
      next(err);
    });
});

// Update 
router.post('/update/', async (req, res, next) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.body.id, {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      role: req.body.role,
    }, { new: true });

    if (!updatedUser) {
      // User with the specified ID not found
      return res.status(404).send('User not found');
    }

    console.log(updatedUser);
    res.redirect('/action/');
  } catch (err) {
    // Handle the error appropriately
    next(err);
  }
});

// Delete
router.get('/delete/:id', (req, res, next) => {
  var id = req.params.id;
  User.findByIdAndDelete(id)
    .then((data) => {
      res.redirect('/action');
    })
    .catch((err) => {
      console.error(err);
      next(err);
    });
});

module.exports = router;
