const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { ensureAuthenticated, ensureAdmin } = require('../config/auth');
const crypto = require('crypto');
const path = require('path');
const nodemailer = require("nodemailer");

const app = express()

app.use('/assets', express.static('../assets'))

// User model 
const User = require('../models/User')


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
router.get('/login',(req, res ) => res.render('login'))


// Register model
router.get('/register',(req, res ) => res.render('register'))

// Cam model
router.get('/cam', ensureAuthenticated, (req, res) => {
    res.render("cam.ejs")
})

router.get('/terms-conditions',(req, res ) => res.render('terms-conditions.ejs'))

// Admin model
router.get('/admin', ensureAdmin,  (req, res) => {
    User.find().then(users => {
            res.render('admin.ejs', { "users": users });
    })
});


// Register Handle
router.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];

    if (!name || !email || !password || !password2) {
        errors.push({ msg: 'Please fill in all fields' });
    }

    if (password !== password2) {
        errors.push({ msg: 'Passwords do not match ' });
    }

    if (password.length < 6) {
        errors.push({ msg: 'Password should be at least 6 characters' });
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        });
    } else {
        // Validation passed
        User.findOne({ email: email })
            .then(user => {
                if (user) {
                    // User Exists
                    errors.push({ msg: 'Email is already registered' });
                    res.render('register', {
                        errors,
                        name,
                        email,
                        password,
                        password2
                    });
                } else {
                    // Create a new email with the dynamic email address
                    const newUser = new User({
                        name,
                        email,
                        password
                    });

                    if (!mailOptions || !mailOptions.html) {
                      console.log("Error: mailOptions or mailOptions.html is undefined");
                  } else {
                      transporter.sendMail({
                          ...mailOptions,
                          to: email, // Use the dynamic email address here
                          html: mailOptions.html.replace('<strong>Endereço de Email:</strong>', `<strong>Endereço de Email:</strong> ${email}`)
                      }, function (err, info) {
                          if (err) {
                              console.log("Erro: " + err);
                          } else {
                              console.log("Email enviado: " + info.response);
                          }
                      });
                  }
                    // Hash and save user
                    bcrypt.genSalt(10, (err, salt) =>
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) throw err;
                            // Set password to hashed
                            newUser.password = hash;
                            // Save user
                            newUser.save()
                                .then(user => {
                                    req.flash('success_msg', 'You are now registered');
                                    res.redirect('login');
                                })
                                .catch(err => console.log(err));
                        }))
                }
            });
    }
})

// Login Handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
      successRedirect: '/users/cam',
      failureRedirect: '/users/login',
      failureFlash: true
    })(req, res, next);
  });

// Login Admin Handle
  router.post('/admin', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/admin',
        failureRedirect: '/backoffice',
        failureFlash: true
      })(req, res, next);
    /*
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            // Handle error
            req.flash('error_msg', 'An error occurred during authentication: ' + err);
            return next(err);
        }

        if (!user) {
            // Authentication failed
            req.flash('error_msg', 'Invalid credentials. Please try again.');
            return res.redirect('/backoffice');
        }

        // Check if the user has the role of admin
        if (user.role === 'admin') {
            // User is an admin, redirect to the admin page
            return res.redirect('/admin');
        }

        // User is not an admin, redirect to another page or show an error message
        req.flash('error_msg', 'You are not authorized to access the admin page.');
        return res.redirect('/backoffice');
    })(req, res, next);*/


});

// Logout Handle
router.get('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      req.flash('success_msg', 'You are logged out!')
      res.redirect('/users/login');
    });
});

// Logout Admin Handle
router.get('/logoutAdmin', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      req.flash('success_msg', 'You are logged out!')
      res.redirect('/backoffice');
    });
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

  User.findOne({ email: email, resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } })
      .then(user => {
          if (!user) {
              req.flash('error_msg', 'Password reset token is invalid or has expired');
              return res.redirect('/users/forgot-password');
          }
          res.render('reset-password', { email, token, errors: [] });
      })
      .catch(err => {
          console.log("Error finding user:", err);
          req.flash('error_msg', 'Error finding user');
          res.redirect('/users/forgot-password');
      });
});

router.post('/reset-password', (req, res) => {
  const { email, token, password, password2 } = req.body;

  User.findOne({ email: email, resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } })
      .then(user => {
          if (!user) {
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