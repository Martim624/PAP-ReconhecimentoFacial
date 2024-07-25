const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { ensureAuthenticated, ensureAdmin } = require('../config/auth');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const path = require('path');
const User = require('../models/User');

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'yagetunes@gmail.com',
    pass: 'qpui cpeq wldl othh' // Note: Consider using environment variables for sensitive data
  }
});

// Function to create email template for registration and password reset
const createEmailTemplate = (title, content) => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<style>
  body { font-family: 'Arial', sans-serif; background-color: #f4f4f4; color: #333; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 20px auto; padding: 20px; background: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
  .logo { text-align: center; margin-bottom: 20px; }
  .logo img { max-width: 100px; }
  .content { text-align: center; }
  .footer { margin-top: 30px; text-align: center; font-size: 0.8em; color: #888; }
  ul { text-align: left; list-style-type: none; padding: 0; }
  li { margin-bottom: 10px; }
  h1 { color: #333; }
  p { color: #666; }
  .social-icons { text-align: center; margin-top: 20px; }
  .social-icons img { width: 30px; margin: 0 10px; }
</style>
</head>
<body>
<div class="container">
  <div class="logo">
    <img src="cid:logo" alt="YAgeTunes Logo">
  </div>
  <div class="content">
    <h1>${title}</h1>
    <p>${content}</p>
  </div>
  <div class="footer">
    <p>YAgeTunes Team</p>
    <div class="social-icons">
      <a href="https://www.instagram.com/YAgetunes" target="_blank">
        <img src="cid:instagram" alt="Instagram">
      </a>
    </div>
  </div>
</div>
</body>
</html>
`;

// Email options function
const mailOptions = (email, subject, htmlContent) => ({
  from: 'yagetunes@gmail.com',
  to: email,
  subject: subject,
  html: htmlContent,
  attachments: [
    {
      filename: 'logo.png',
      path: path.join(__dirname, '../assets/img/logo.png'),
      cid: 'logo'
    },
    {
      filename: 'instagram.png',
      path: path.join(__dirname, '../assets/img/instagram.png'),
      cid: 'instagram'
    }
  ]
});

// Login model
router.get('/login', (req, res) => res.render('login'));

// Register model
router.get('/register', (req, res) => res.render('register'));

// CAM model
router.get('/cam', ensureAuthenticated, (req, res) => {
  res.render("cam.ejs");
});

// Admin model
router.get('/admin', ensureAdmin, (req, res) => {
  User.find().then(users => {
    res.render('admin.ejs', { users: users });
  }).catch(err => {
    console.log(err);
    req.flash('error_msg', 'Error fetching users');
    res.redirect('/users/login');
  });
});

// Register Handle
router.post('/register', (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please fill in all fields' });
  }

  if (password !== password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password should be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('register', { errors, name, email, password, password2 });
  } else {
    User.findOne({ email: email })
      .then(user => {
        if (user) {
          errors.push({ msg: 'Email is already registered' });
          res.render('register', { errors, name, email, password, password2 });
        } else {
          const newUser = new User({
            name,
            email,
            password
          });

          bcrypt.genSalt(10, (err, salt) =>
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;
              newUser.password = hash;
              newUser.save()
                .then(user => {
                  const subject = 'Welcome to YAgeTunes!';
                  const htmlContent = createEmailTemplate(subject, `
                    Your email has been successfully registered.
                    Thank you for joining us.
                    Here are the details of your new account:
                    <br><br>
                    <ul>
                      <li><strong>Email Address:</strong> ${email}</li>
                      <li><strong>Registration Date:</strong> ${new Date().toLocaleDateString()}</li>
                    </ul>
                    <p>Please keep your credentials secure and do not share them with anyone.</p>
                    <p>If you have any questions or need assistance, do not hesitate to contact us.</p>
                    <p>Thank you!</p>
                  `);

                  transporter.sendMail(mailOptions(email, subject, htmlContent), (err, info) => {
                    if (err) {
                      console.log("Error sending email: " + err);
                      req.flash('error_msg', 'Error sending registration email');
                      res.redirect('/users/register');
                    } else {
                      console.log("Email sent: " + info.response);
                      req.flash('success_msg', 'You are now registered and can log in');
                      res.redirect('/users/login');
                    }
                  });
                })
                .catch(err => console.log(err));
            }));
        }
      });
  }
});

// Login Handle
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/users/cam',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

// Logout Handle
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

// Forgot Password Form
router.get('/forgot-password', (req, res) => {
  res.render('forgot-password');
});

// Process Forgot Password Form
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;

  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        req.flash('error_msg', 'Email not registered');
        return res.redirect('/users/forgot-password');
      }

      const token = crypto.randomBytes(20).toString('hex');
      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

      user.save().then(() => {
        const subject = 'Password Reset Instructions';
        const htmlContent = createEmailTemplate(subject, `
          We have received a request to reset your password.
          To reset your password, please click on the following link:
          <br><br>
          <a href="http://${req.headers.host}/users/reset-password/${email}?token=${token}" style="background-color: #4CAF50; color: white; padding: 15px 25px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer;">Reset Password</a>
          <br><br>
          If you did not request this, please ignore this email.
        `);

        transporter.sendMail(mailOptions(email, subject, htmlContent), (err, info) => {
          if (err) {
            console.log("Error sending email: " + err);
            req.flash('error_msg', 'Error sending password reset email');
            return res.redirect('/users/forgot-password');
          }
          console.log("Email sent: " + info.response);
          req.flash('success_msg', 'Password reset instructions sent');
          res.redirect('/users/login');
        });
      }).catch(err => {
        console.log(err);
        req.flash('error_msg', 'Error processing request');
        res.redirect('/users/forgot-password');
      });
    })
    .catch(err => {
      console.log(err);
      req.flash('error_msg', 'Error processing request');
      res.redirect('/users/forgot-password');
    });
});

// Reset Password Form
router.get('/reset-password/:email', (req, res) => {
  const { email } = req.params;
  const { token } = req.query;

  console.log("Reset Password Route Hit");
  console.log("Email:", email);
  console.log("Token:", token);

  User.findOne({ email: email, resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } })
      .then(user => {
          if (!user) {
              console.log("No user found or token expired");
              req.flash('error_msg', 'Password reset token is invalid or has expired');
              return res.redirect('/users/forgot-password');
          }
          // Log user details
          console.log("User found:", user);
          // Render the reset password form with the email, token, and errors array
          res.render('reset-password', { email, token, errors: [] });
      })
      .catch(err => {
          console.log("Error finding user:", err);
          req.flash('error_msg', 'Error finding user');
          res.redirect('/users/forgot-password');
      });
});

// Process Reset Password Form
router.post('/reset-password', (req, res) => {
  const { email, token, password, password2 } = req.body;

  console.log("Reset Password POST Request Received");
  console.log(req.body); // Debug: log the form data to ensure it's correct

  User.findOne({ email: email, resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } })
      .then(user => {
          if (!user) {
              console.log("No user found or token expired in POST request");
              req.flash('error_msg', 'Password reset token is invalid or has expired');
              return res.redirect('/users/forgot-password');
          }

          let errors = [];
          if (!password || !password2) {
              errors.push({ msg: 'Please fill in all fields' });
          }
          if (password !== password2) {
              errors.push({ msg: 'Passwords do not match' });
          }
          if (password.length < 6) {
              errors.push({ msg: 'Password should be at least 6 characters' });
          }

          if (errors.length > 0) {
              return res.render('reset-password', { errors, email, token });
          } else {
              bcrypt.genSalt(10, (err, salt) => {
                  bcrypt.hash(password, salt, (err, hash) => {
                      if (err) throw err;
                      user.password = hash;
                      user.resetPasswordToken = undefined;
                      user.resetPasswordExpires = undefined;

                      user.save()
                          .then(() => {
                              console.log("Password reset successfully");
                              req.flash('success_msg', 'Password reset successfully');
                              res.redirect('/users/login');
                          })
                          .catch(err => {
                              console.log("Error saving user after password reset:", err);
                              req.flash('error_msg', 'Error resetting password');
                              res.redirect(`/users/reset-password/${email}?token=${token}`);
                          });
                  });
              });
          }
      })
      .catch(err => {
          console.log("Error processing reset password request:", err);
          req.flash('error_msg', 'Error processing request');
          res.redirect('/users/forgot-password');
      });
});

module.exports = router;
