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
    console.log(req.body);
    res.send('hello');
})

module.exports = router;