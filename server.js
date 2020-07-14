require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const passport = require('passport');
const cookieSession = require('cookie-session');

const initialisePassport = require('./passport/passport-config');
initialisePassport(passport);

const app = express();
app.use(express.static(path.join(__dirname, 'build')));
app.use(express.urlencoded({ extended: false }));
app.use(cookieSession({
  name: 'session',
  secret: process.env.SESSION_SECRET,
}));
app.use(passport.initialize());
app.use(passport.session());

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

//ROUTES FILES
const userLogin = require('./routes/userLogin');
app.use(userLogin);

const redirectRoutes = require('./routes/redirectedRoutes');
app.use(redirectRoutes);



app.listen(process.env.PORT || 8080, () => {
  console.log("Listening on port 8080")
});

// to see development changes in the react app, run 'npm start'
// to be able to connect to the database, run 'nodemode server.js' too