require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const passport = require('passport');
const cookieSession = require('cookie-session');
const connection = require("./API/connection");
const mailer = require('./API/email');

const initialisePassport = require('./API/passport/passport-config');
initialisePassport(passport);

const app = express();
app.use(express.static(path.join(__dirname, 'build')));
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieSession({
  name: 'session',
  secret: process.env.SESSION_SECRET,
}));
app.use(passport.initialize());
app.use(passport.session());
mailer();

connection.connect(err => {
  if(err) {
      return err;
  } else {
    console.log("API Connected!");
  }
});

//TESTING ROUTES
app.get('/ping', function (req, res) {
  return res.send('pong');
 });

//MAIN ROUTE
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

//ROUTE THAT GOES STRAIGHT TO ADMINISTRATOR ON REACT
app.get('/administrator', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.get('/org/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});



//ROUTES FILES
const userLogin = require('./API/routes/userLogin');
app.use(userLogin);

const redirectRoutes = require('./API/routes/redirectedRoutes');
app.use(redirectRoutes);

const organisationRoutes = require('./API/routes/organisationRoute');
app.use(organisationRoutes);

app.listen(process.env.PORT || 8080, () => {
  console.log("Listening on port 8080")
});

// to see development changes in the react app, run 'npm start'
// to be able to connect to the database, run 'nodemode server.js' too