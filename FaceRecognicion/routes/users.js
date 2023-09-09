const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')
const passport = require('passport')
const { ensureAuthenticated, ensureAdmin } = require('../config/auth')


// Email Controller
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "xxlordhdxx624@gmail.com",
    pass: "eeijtawajfifjolp"
  }
})

const mailOptions = {
    from: "yagetunes@info.pt",
    to: "xxlordhdxx624@gmail.com",
    subject: "Novo Email Registado",
    html: `
      <html>
        <body>
          <h1>Bem-vindo ao YAgeTunes!</h1>
          <p>O seu email foi registado com sucesso.</p>
          <p>Agradecemos por se juntar a nós.</p>
          <p>Aqui estão os detalhes do seu novo email:</p>
          <ul>
            <li><strong>Endereço de Email:</strong> </li>
            <li><strong>Data de Registo:</strong> 09 de setembro de 2023</li>
          </ul>
          <p>Por favor, mantenha as suas credenciais em segurança e não as partilhe com ninguém.</p>
          <p>Se tiver alguma dúvida ou precisar de assistência, não hesite em contactar-nos.</p>
          <p>Obrigado!</p>
        </body>
      </html>
    `,
  };
  
const app = express()

app.use('/assets', express.static('../assets'))

// User model 
const User = require('../models/User')

// Login model
router.get('/login',(req, res ) => res.render('login'))

// Register model
router.get('/register',(req, res ) => res.render('register'))

// Cam model
router.get('/cam', ensureAuthenticated, (req, res) => {
    res.render("cam.ejs")
})

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

module.exports = router;