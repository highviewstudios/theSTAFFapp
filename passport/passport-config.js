require('dotenv').config();

const LocalStrategy = require('passport-local').Strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy
const GithubStrategy = require('passport-github2').Strategy
const bcrypt = require('bcrypt');
const mysql = require("mysql");

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

connection.connect(err => {
    if(err) {
        return err;
    }
});
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

        connection.query(SELECT_QUERY, data, (err, results) => {
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
        processGoogleUser(user.displayName, user.id);
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

        connection.query(SELECT_QUERY, data, (err, results) => {
            if(err) {
                reject();
            } else {
                user = results[0];
                resolve();
            }
        });
    });
    }

    //Google Strategy
    function processGoogleUser(name, id) {

        const data1 = {id: id}
        const FIND_QUERY = "SELECT * FROM users WHERE ?";

        connection.query(FIND_QUERY, data1, (err, results) => {
            if(err) {
                console.error(err);
            } else {
                if(results[0] == null) {

                    const data2 = {id: id, strategy: "google", displayName: name}
                    const INSERT_QUERY = "INSERT INTO users SET ?";
        
                    connection.query(INSERT_QUERY, data2, (err, results) => {
                        if(err) {
                            console.error(err);
                        } else {
                            console.info("Successfully added user");
                        }
                    });
                }
            }
        });
    }
}



module.exports = initialize;