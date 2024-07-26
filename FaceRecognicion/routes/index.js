const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureAuthenticatedAdmin, ensureAdmin } = require('../config/auth');
const User = require('../models/User');
const bcrypt = require('bcryptjs')
const spotifyApi = require('../config/spotify');

router.get('/getTrack', async (req, res) => {
  const age = parseInt(req.query.age, 10);

  let playlistId;
  if (age < 23) {
    playlistId = 'https://open.spotify.com/playlist/3ZynkCm6mqjnsqaGui6QJ4?si=f3f04b6ec74b48fa';
  } else if (age < 33) {
    playlistId = 'https://open.spotify.com/playlist/4dBitGBNmxdfoBB3LLl5jc?si=37fbe3ae5447411c';
  } else {
    playlistId = 'https://open.spotify.com/playlist/3ZynkCm6mqjnsqaGui6QJ4?si=82d0d94350714ca8';
  }

  try {
    const data = await spotifyApi.getPlaylistTracks(playlistId, { limit: 1, offset: Math.floor(Math.random() * 50) });
    const track = data.body.items[0].track;
    res.json({ url: track.external_urls.spotify });
  } catch (err) {
    console.error('Error fetching track from Spotify:', err);
    res.status(500).send('Internal Server Error');
  }
});


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
