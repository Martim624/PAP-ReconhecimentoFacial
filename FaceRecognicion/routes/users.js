const express = require('express');
const router = express.Router();

const app = express()

app.use('/assets', express.static('../assets'))

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
        erros.push({ msg: 'Passwords do not match '});
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
        res.send('pass');
    }
})

module.exports = router;