require('dotenv').config();
const express = require('express');
const passport = require('passport');
const { uuid } = require('uuidv4');
const bcrypt = require('bcrypt');
const generatePass = require('generate-password');
const mySQLConnection = require('../connection');
const email = require('../email');
const moment = require('moment');

const router = express.Router();

//USER TEST
router.get("/test", (req, res) => {
    
    //UpdateGoogleUser('shaungevans1991@gmail.com', '123456');
    const json = {
        test: "running - complete",
        outcome: "sucess"
    }
    res.send(json);
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

//LOCAL LOGIN
router.get("/login", async function(req, res, next) { 

        let continu = false;
        const email = req.query.email;
        const user = await GetUserByEmail(email);
        
        if(user == null) {
            const json = {
                error: 'null',
                userError: 'Yes',
                info: 'Email is not connected to any organisation'
            }
            res.send(json);
        } else {
            if(user.new == 'false' && user.strategy != 'local') {
                const json = {
                    error: 'null',
                    userError: 'Yes',
                    info: 'This is not the login method you use to log in'
                }
                res.send(json);
            } else {
            continu = true;
            }
        }

        if(continu) {
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
                            return res.json({...user, message: "Logged in successful"});
                        });
                    }
                }
            })(req, res, next);
        }
});

//GOOGLE LOGIN
router.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/development',
    passport.authenticate('google', { failureRedirect: '/passport-error' }),
    async function(req, res) {

        let continu = false;
        const user = await GetUserByEmail(req.user.emails[0].value);
        
        if(user == null) {
            req.logOut();
            res.redirect("/notConnected");
        } else if (user.new == 'true') {
            await UpdateGoogleFirstTimeUser(req.user.emails[0].value, req.user.id);
            continu = true;
        } else {

            if(user.strategy != 'google') {
                req.logOut();
                res.redirect('/org/' + user.orgID + '/wrongLogin');
            } else {
                continu = true;
            }
        }

        if(continu) {
            
                const json = {
                    error: "null",
                    message: "Logged in successfully", 
                    name: req.user.displayName,
                    email: req.user.emails[0].value,
                    auth: req.isAuthenticated(),
                    id: req.user.id
                    }
                //res.send(json);
                res.redirect("/");
        }
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
            const date = moment().format('DD/MM/YYYY');
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
            const date = moment().format('DD/MM/YYYY');
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
                const hashedPassword = await bcrypt.hash(password, parseInt(process.env.SALT));
                const data = {id: uid, strategy: "local", displayName: name, email: email, password: hashedPassword}
                const INSERT_QUERY = "INSERT INTO users SET ?";
                mySQLConnection.query(INSERT_QUERY, data, (err) => {
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

//TO CREATE PASSWORD
router.post('/createPassword', async (req, res) => {
    
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;
    const confirmPassword = req.body.confirmPassword;

    const user = await GetUserByID(req.user);

    if(!await bcrypt.compare(oldPassword, user.password)) {
        const json = {
            error: 'null',
            userError: 'Yes',
            message: 'You current password is not correct'
        }
        res.send(json);
    } else if (!ValidatePassword(newPassword)) {
        const json = {
            error: "null",
            userError: "Yes",
            message: "Your password is not strong enough"
        }
        res.send(json);
     } else if(newPassword != confirmPassword) {
        const json = {
            error: 'null',
            userError: 'Yes',
            message: 'You new password does not match'
        }
        res.send(json);
    } else {
        const hashedPassword = await bcrypt.hash(newPassword, parseInt(process.env.SALT));
        const result = await UpdateLocalFirstTimeUser(hashedPassword, user.id);

        if(result == 'success') {
            
            const userDetails = await GetUserByID(user.id);
            const json = {
                error: 'null',
                userError: 'null',
                message: 'Updated user first password',
                user: userDetails
            }
            res.send(json);
        }
    }
});

//REQUEST NEW PASSWORD
router.post('/requestPassword', async(req, res) => {

    const uEmail = req.body.email;

    const user = await GetUserByEmail(uEmail);

    if(user == null) {
        const json = {
            error: 'null',
            userError: 'Yes',
            message: 'There is no user with that email reqistered'
        }
        res.send(json);
    } else if(user.strategy == '') {
        const json = {
            error: 'null',
            userError: 'Yes',
            message: 'This user has not set up their account yet, please see your registration email'
        }
        res.send(json);
    } else if(user.strategy != 'local') {
        const json = {
            error: 'null',
            userError: 'Yes',
            message: 'This user uses Google to log into the website'
        }
        res.send(json);
    } else {
        const password = generatePass.generate({length: 10, numbers: true, uppercase: true});
        const hashedPassword = await bcrypt.hash(password, parseInt(process.env.SALT));
        await UpdateUserPassword(hashedPassword, user.email, 'true');

        //Send email
        let mailOptions = {
            from: '"My STAFF" <staff-development@high-view-studios.co.uk>', // sender address
            to: user.email, // list of receivers
            subject: "New Password Requested", // Subject line
            template: 'requestNewPassword',
            context: {
                name: user.displayName,
                email: user.email,
                password: password,
                orgID: user.orgID
            }
        };
        //send mail with defined transport object
        email.mail.sendMail(mailOptions, (error, info) => {
            if(error) {
                return console.log(error);
            }
        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

        console.log("Email has been sent");
        });

        const json = {
            error: "null",
            userError: "null",
            message: "Successfully requested new password"
        }
        res.send(json);
    }
});

//TO CHANGE PASSWORD
router.post('/changePassword', async (req, res) => {
    
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;
    const confirmPassword = req.body.confirmPassword;

    const user = await GetUserByID(req.user);

    if(!await bcrypt.compare(oldPassword, user.password)) {
        const json = {
            error: 'null',
            userError: 'Yes',
            message: 'You current password is not correct'
        }
        res.send(json);
    } else if (!ValidatePassword(newPassword)) {
        const json = {
            error: "null",
            userError: "Yes",
            message: "Your password is not strong enough"
        }
        res.send(json);
     } else if(newPassword != confirmPassword) {
        const json = {
            error: 'null',
            userError: 'Yes',
            message: 'You new password does not match'
        }
        res.send(json);
    } else {
        const hashedPassword = await bcrypt.hash(newPassword, parseInt(process.env.SALT));
        const result = await UpdateUserPassword(hashedPassword, user.email, 'false');

        if(result == 'success') {
            
            const userDetails = await GetUserByID(user.id);
            const json = {
                error: 'null',
                userError: 'null',
                message: 'Updated user password',
                user: userDetails
            }
            res.send(json);
        }
    }
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

        mySQLConnection.query(FIND_QUERY, data, (err, result) => {
            if(err) {
                console.log(err);
                reject();
            } else {
                resolve(result[0]);
            }
        });
        })
}

//Works within the '/login' route
function GetUserByEmail(email) {
    return new Promise ((resolve, reject) => {
    
        const data = {email: email}
        const FIND_QUERY = "SELECT * FROM users WHERE ?";

        mySQLConnection.query(FIND_QUERY, data, (err, result) => {
            if(err) {
                console.log(err);
                reject();
            } else {
                resolve(result[0]);
            }
        });
        })
}

//Google Strategy
function UpdateGoogleFirstTimeUser(email, id) {
    return new Promise((resolve, reject) => {
    const UPDATE_QUERY = "UPDATE users SET ? WHERE email=?";
    const data = [{id: id, strategy: 'google', new: 'false'}, email];

    mySQLConnection.query(UPDATE_QUERY, data, (err, results) => {
        if(err) {
            reject();
        } else {
            resolve();
        }
    });
    })
}

//Local Strategy
function UpdateLocalFirstTimeUser(newPassword, id) {
    return new Promise ((resolve, reject) => {
        const data = [{strategy: 'local', password: newPassword, new: 'false'}, id];
        const UPDATE_QUERY = "UPDATE users SET ? WHERE id=?";
        mySQLConnection.query(UPDATE_QUERY, data, (err, results) => {
            if(err) {
                reject("fail");
            } else {
                resolve('success');
            }
        });
    })
}

function UpdateUserPassword(newPassword, email, request) {
    return new Promise ((resolve, reject) => {
        const data = [{password: newPassword, requestedPassword: request}, email];
        const UPDATE_QUERY = "UPDATE users SET ? WHERE email=?";
        mySQLConnection.query(UPDATE_QUERY, data, (err, results) => {
            if(err) {
                reject("fail");
            } else {
                resolve('success');
            }
        });
    })
}
        


module.exports = router;