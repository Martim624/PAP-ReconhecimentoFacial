// Importing 
const express = require("express")
const app = express()
const path = require('path')


app.use('/assets', express.static('assets'))

// Routes
app.get('/', (req, res) => {
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


// End Routes


app.listen(3000)