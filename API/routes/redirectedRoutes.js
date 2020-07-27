const express = require('express');
const path = require('path')
const router = express.Router();

router.get("/org/:id/signin", (req, res) => {
    const id = req.params.id;
    res.redirect('/org/'+ id);
});

router.get("/org/:id/createPassword", (req, res) => {
    const id = req.params.id;
    res.redirect('/org/'+ id);
});

router.get("/org/:id/changePassword", (req, res) => {
    const id = req.params.id;
    res.redirect('/org/'+ id);
});

router.get("/org/:id/forgotPassword", (req, res) => {
    res.sendFile(path.join(__dirname, '../../build', 'index.html'));
});

router.get("/org/:id/wrongOrganisation", (req, res) => {
    res.sendFile(path.join(__dirname, '../../build', 'index.html'));
});

router.get("/org/:id/wrongLogin", (req, res) => {
    res.sendFile(path.join(__dirname, '../../build', 'index.html'));
});

router.get("/org/:id/organisationAdmin", (req, res) => {
    res.sendFile(path.join(__dirname, '../../build', 'index.html'));
});

router.get("/home", (req, res) => {
    res.redirect('/');
});

//ADMINISTRATOR
router.get("/administrator/signin", (req, res) => {
    res.redirect('/administrator');
});

router.get("/administrator/organisationRegister", (req, res) => {
    res.sendFile(path.join(__dirname, '../../build', 'index.html'));
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
