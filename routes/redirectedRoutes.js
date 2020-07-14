const express = require('express');
const path = require('path')
const router = express.Router();

router.get("/signin", (req, res) => {
    res.redirect('/');
});

router.get("/home", (req, res) => {
    res.redirect('/');
});

router.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

//ADMINISTRATOR
router.get("/administrator/signin", (req, res) => {
    res.redirect('/administrator');
});

router.get("/administrator/organisationRegister", (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

router.get("/administrator/home", (req, res) => {
    res.redirect('/administrator');
});

module.exports = router;
