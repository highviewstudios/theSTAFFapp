require('dotenv').config();

const LocalStrategy = require('passport-local').Strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy
const GithubStrategy = require('passport-github2').Strategy
const bcrypt = require('bcrypt');
const mySQLConnection = require('../connection');

let user;

function initialize(passport) {
    
    //Local Strategy
    const authenticateUser = async (email, password, done) => {

        await getUserByEmail(email);
        
        if(user == null) {
            return done(null, false, { message: "No user with that email"})
        }

        try {
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user);
            } else {
                return done(null, false, { message: "Password Incorrect"});
            }
        } catch (e) {
            return done(e);
        }
    }

    passport.use(new LocalStrategy({ usernameField: "email"}, authenticateUser));

    passport.serializeUser(function(user, done) {
        done( null, user.id)
    });
    passport.deserializeUser((id, done) => {
        
        const data = {id: id}
        const SELECT_QUERY = "SELECT * FROM users WHERE ?";

        mySQLConnection.query(SELECT_QUERY, data, (err, results) => {
            if(err) {
                return done(err, null)
            } else {
                return done(null, id);
            }
        });
     });

    //Google Strategy
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_SECRET,
        callbackURL: process.env.HOST_CALLBACK_URL + "/auth/google/development",
        userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo'
        },
        function(accessToken, refreshToken, profile, cb) {
        user = {... profile }
        return cb(null, profile);
        }
    ));
    //end of Google Strategy

    //GitHub Strategy
    passport.use(new GithubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_SECRET,
    callbackURL: process.env.HOST_CALLBACK_URL + "/auth/github/development"
    },
    function(accessToken, refreshToken, profile, cb) {
        user = {... profile}
        console.log(user.displayName);
        
        return cb(null, profile);
}));
    //end of GitHub Strategy

     //MY METHODS - MySQL
     //local Strategy
    function getUserByEmail(email) {
    return new Promise ((resolve, reject) => {
        
        const data = {email: email}
        const SELECT_QUERY = "SELECT * FROM users WHERE ?";

        mySQLConnection.query(SELECT_QUERY, data, (err, results) => {
            if(err) {
                reject();
            } else {
                user = results[0];
                resolve();
            }
        });
    });
    }
}



module.exports = initialize;