// Importing 
const express = require("express")
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');

const app = express()

// DB Config

const db = require('./config/keys').MongoURI;

// Connect to Mongo
mongoose.connect(db,{useNewUrlParser: true})
.then(() => console.log('MongoDB Connected...')) 
.catch(err => console.log(err));

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

app.use('/assets', express.static('assets'))

// Bodyparser
app.use(express.urlencoded({ extended: false}))

// Routes
app.use('/', require('./routes/index'))
app.use('/users', require('./routes/users'));



// End Routes
app.listen(3000)




/*

app.use(express.urlencoded({extended: false}));


app.get('/home', (req, res) => {
    res.render("index.ejs")
})

app.get('/login', (req, res) => {
    res.render("login.ejs")
})

app.get('/register', (req, res) => {
    res.render("register.ejs")
})

app.get('/cam', (req, res) => {
    res.render("cam.ejs")
})
*/
