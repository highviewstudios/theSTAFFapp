const express = require('express');
const path = require('path')
const router = express.Router();

router.get("/signin", (req, res) => {
    res.redirect('/');
});

router.get("/home", (req, res) => {
    res.redirect('/');
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

//ROUTE THAT GOES STRAIGHT TO 'notConnected' ON REACT
router.get('/notConnected', (req, res) => {
    res.sendFile(path.join(__dirname, '../../build', 'index.html'));
});
  
//ROUTE THAT GOES STRAIGHT TO 'wronglogin' ON REACT
router.get('/org/:id/wronglogin', (req, res) => {
    res.sendFile(path.join(__dirname, '../../build', 'index.html'));
});

module.exports = router;
