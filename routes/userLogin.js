require('dotenv').config();
const express = require('express');
const passport = require('passport');
const mysql = require("mysql");
const { uuid } = require('uuidv4');
const bcrypt = require('bcrypt');

const router = express.Router();

//USER TEST
router.get("/test", (req, res) => {
    const json = {
        test: "running - complete",
        outcome: "sucess"
    }
    res.send(json);
});

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

//Checks a user is Authenticated
router.get("/auth", async function(req, res) {
    if(req.isAuthenticated()) {
        
        if(req.user == process.env.ADMIN_ID) {
            const json = {
                through: "YES",
                auth: true,
                role: "superAdmin",
            }
            res.send(json);
        } else {

            const userDetails = await GetUserByID(req.user);
            const json = {
                through: "YES",
                auth: true,
                role: "user",
                user: userDetails 
            }
            res.send(json);
        }
        
        
} else {
    const json = {
        through: "yes",
        auth: false, 
    }
    res.send(json);
}
});

// Admin - check if user is authenticated and has permission
router.get("/administrator/auth", (req, res) => {
    if(req.isAuthenticated()) {
        if(req.user != process.env.ADMIN_ID) {
            const json = {
                auth: true,
                access: "denied"
            }
            res.send(json);
        } else {
            const json = {
                auth: true,
                access: "granted"
            }
            res.send(json);
        }
    } else {
        const json = {
            auth: false
        }
        res.send(json);
    }
});

router.get("/login", function(req, res, next) { 

    passport.authenticate('local', function (err, user, info) {
    if(err) {
        const json = {
            error: err,
        }
        res.send(json);
    } else {
        if(!user) {
            res.send({...user, message: "Login unsuccessful", info: info.message});
        } else {
            req.login(user, function(error) {
                if(error) {
                    return res.status(500).json({
                        message: "oops, something happed",
                    });
                }
                return res.json({...user, role: "user", message: "Logged in successful"}); //NEEDS CHANGING WHEN ADDING ROLE TO DATABASE
            });
        }
    }
})(req, res, next);
});

//GOOGLE LOGIN
router.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/development',
    passport.authenticate('google', { failureRedirect: '/passport-error' }),
    function(req, res) {
      // Successful authentication, send successful json.
      const json = {
        error: "null",
        message: "Logged in successfully", 
        name: req.user.displayName,
        auth: req.isAuthenticated()
        }
    console.log(json);
    res.redirect("/");
    //res.send(json);
});

//GITHUB LOGIN
router.get('/auth/github',
    passport.authenticate('github'));

router.get("/auth/github/development",
    passport.authenticate('github', {failureRedirect: '/login'}),
    function(req, res) {
        //Successful authentiaction, redirect home
        if(req.user.id == process.env.ADMIN_ID) {
            const json = {
                error: "null",
                access: "granted", 
                name: req.user.displayName
            }
            console.log('access granted');

            //Log action into database
            const date = new Date().toLocaleString('en-GB', {timeZone: 'UTC'});
            //logAdminAction(date, 'Logged into the admin area');
            //res.send(json);
            res.redirect(process.env.REDIRECT_URL +"administrator");
        } else {
            const json = {
                error: "null",
                access: "denied"
            }
            console.log('access denied');

            //Log action into database
            const date = new Date().toLocaleString('en-GB', {timeZone: 'UTC'});
            //logAdminAction(date, 'Unauthorised login attempted into the admin area');
            //res.send(json);
            res.redirect("/administrator");
        }
    }
);

//PASSPORT ERROR
router.get("/passport-error", (req, res) => {
    const json = {error: "passport failure redirect"};
    res.send(json);
});

//LOG OUT OF USER
router.get("/logout", (req, res) => {
    console.log("LO");
    req.logOut();
    const json = {
        error: "null",
        message: "User logged out"
    }
    res.send(json);
});

//LOG OUT OF ADMINISTRATOR
router.get("/administrator/logout", (req, res) => {
    req.logOut();
    const json = {
        error: "null",
        message: "User logged out"
    }
    res.redirect("/administrator");
});

//FORCE LOG OUT
router.get("/f/logout", (req, res) => {
    req.logOut();
    const json = {
        error: "null",
        message: "User logged out"
    }
    res.send(json);
});

//REGISTER
router.get("/register/:name/:email/:password/:confirmPassword", async (req, res) => {
    console.log("There's a hit!");
    try {
            const name = req.params.name;
            const email = req.params.email;
            const password = req.params.password;
            const confirmPassword = req.params.confirmPassword;
            const uid = uuid();
            
            if(/^[a-zA-Z0-9- ]*$/.test(name) == false) 
            {
                const json = {
                    error: "null",
                    userError: "Yes",
                    message: "You cannot have any special characters in your name"
                }
                res.send(json);
            } else if (!ValidateEmail(email)) {
                const json = {
                    error: "null",
                    userError: "Yes",
                    message: "The email address you have provided is not valid"
                }
                res.send(json);
            } else if (!ValidatePassword(password)) {
                const json = {
                    error: "null",
                    userError: "Yes",
                    message: "Your password is not strong enough"
                }
                res.send(json);
            } else if(confirmPassword != password){
                const json = {
                    error: "null",
                    userError: "Yes",
                    message: "Your passwords do not match"
                }
                res.send(json);
            } else {
                console.log("Registering...");
                const hashedPassword = await bcrypt.hash(password, 10);
                const data = {id: uid, strategy: "local", displayName: name, email: email, password: hashedPassword}
                const INSERT_QUERY = "INSERT INTO users SET ?";
                connection.query(INSERT_QUERY, data, (err) => {
                    if(err) {
                        console.error(err);
                    } else {
                        const json = {
                            error: "null",
                            userError: "null",
                            message: "User registered successfully"
                        }
                        res.send(json);
                    }
                })}            
    } catch(e) {
        console.log(e);
    }
    //console.log(users);
});

//FUNCTIONS

function ValidateEmail(mail) 
{
if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail))
{
    return (true)
}
    return (false)
}

function ValidatePassword(password) {
    let check = true;
    
    if(password.length <= 8) {
        check = false;
    } else if(!/[a-z]/.test(password)) {
        check = false;
    } else if(!/[A-Z]/.test(password)){
        check = false;
    } else if(!/\d/.test(password)) {
        check = false;
    } else if(!password.match(/[!@#$%^&*()]/)) {
        check = false;
    }
    
    return check;
}

//Works alongside the '/auth' route
function GetUserByID(id) {
    return new Promise ((resolve, reject) => {
    
        const data = {id: id}
        const FIND_QUERY = "SELECT * FROM users WHERE ?";

        connection.query(FIND_QUERY, data, (err, result) => {
            if(err) {
                console.log(err);
                reject();
            } else {
                resolve(result[0]);
            }
        });
        })
    
}

module.exports = router;