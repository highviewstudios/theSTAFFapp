require('dotenv').config();
const express = require('express');
const mySQLConnection = require('../connection');
const generatePass = require('generate-password');
const bcrypt = require('bcrypt');
const email = require('../email');
const { uuid } = require('uuidv4');

const router = express.Router();

router.get('/administrator/addOrganisation/:orgName/:orgRooms/:authLocal/:authGoogle/:pName/:pEmail', async (req, res) => {
    
    const orgName = req.params.orgName;
    const orgRooms = req.params.orgRooms;
    const authLocal = req.params.authLocal;
    const authGoogle = req.params.authGoogle;
    const pName = req.params.pName;
    const pEmail = req.params.pEmail;

    if(!ValidateNumber(orgRooms)) {
        const json = {
            error: "null",
            userError: "Yes",
            message: "The allocated rooms can only contain numbers"
        }
        res.send(json);
    } else if(!ValidateEmail(pEmail)) {
        const json = {
            error: "null",
            userError: "Yes",
            message: "The email address you have provided is not valid"
        }
        res.send(json);
    }else if(authLocal == 'false' && authGoogle == 'false') {
        const json = {
            error: "null",
            userError: "Yes",
            message: "Please select a login option"
        }
        res.send(json);
    }else {
        
        const user = await GetUserByEmail(pEmail);

        if(user != null) {
            const json = {
                error: "null",
                userError: "Yes",
                message: "The email address you have provided has already been used"
            }
            res.send(json);
        }
        else {
            try {
                const password = generatePass.generate({length: 10, numbers: true, uppercase: true});
                const orgID = generatePass.generate({length: 10, numbers: true, uppercase: false, lowercase: false, symbols: false});

                const resultOrg = await addOrganisation(orgName, orgRooms, authLocal, authGoogle, pName, pEmail, orgID);
                const resultUser = await addUser(pName, pEmail, authLocal, password, authGoogle, "seniorAdmin", orgID);
        
                if(resultOrg == "Success" && resultUser == "Success") {

                    //Send email
                    let mailOptions = {
                        from: '"My STAFF" <staff-development@high-view-studios.co.uk>', // sender address
                        to: pEmail, // list of receivers
                        subject: "Welcome to My STAFF", // Subject line
                        template: 'organisationReg',
                        context: {
                            name: pName,
                            email: pEmail,
                            orgName: orgName,
                            authLocal: authLocal,
                            authGoogle: authGoogle,
                            localPassword: password,
                            orgID: orgID
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
                        message: "Successfully added"
                    }
                    res.send(json);
                } else {
                    const json = {
                        error: "YES",
                        userError: "null",
                        message: "There was an error"
                    }
                    res.send(json);
                } 
                }
                catch (err) {
                    console.log(err);
                }
            }
    }

});

router.get('/organisation/all', async (req, res) => {

    const organisations = await getAllOrganisations();

    res.send(organisations);
});

router.get('/organisation/:id', async (req, res) => {

    const id = req.params.id;

    const organisation = await getOneOrganisation(id);

    if(organisation != null) {
        const json = {
            userError: 'null',
            message: 'organisation found',
            organisation: organisation
        }
        res.send(json);
    } else {
        const json = {
            userError: "Yes",
            message: 'organisation not found'
        }
        res.send(json);
    }
})

router.get("/admin/test", async (req, res) => {

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

function ValidateNumber(number) 
{
    if (!/[0-9]/.test(number))
    {
        return false;
    } else {
        return true;
    }
}
   

function addOrganisation(orgName, orgRooms, authLocal, authGoogle, pName, pEmail, orgID) {

    return new Promise ((resolve, reject) => {
       
        const data = {name: orgName, POC_Name: pName, POC_Email: pEmail, auth_Local: authLocal, auth_Google: authGoogle, allocatedRooms: orgRooms, orgID: orgID};
        const query = "INSERT INTO organisations SET ?";
        mySQLConnection.query(query, data, (err) => {
            if(err) {
                reject();
            } else {
                resolve("Success");
            }
        });
    });
    
}

function addUser(name, email, authLocal, localPassword, authGoogle, role, orgID) {
    return new Promise(async (resolve, reject) => {

        const uid = uuid();
        let hashedPassword = ''; 
        if(authLocal == "true") {
            hashedPassword = await bcrypt.hash(localPassword, parseInt(process.env.SALT));
        }

        const data = {id: uid, displayName: name, email: email, password: hashedPassword, requestedPassword: 'false', new: "true", role: role, orgID: orgID}
        const query = "INSERT users SET ?";
        mySQLConnection.query(query, data, (err, result) => {
            if(err) {
                console.log(err);
                reject();
            } else {
                resolve("Success");
            }
        })


    });
}

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

function getAllOrganisations() {

    return new Promise ((resolve, reject) => {
       
        const query = "SELECT * FROM organisations";
        mySQLConnection.query(query, (err, result) => {
            if(err) {
                reject();
            } else {
                resolve(result);
            }
        });
    });
    
}

function getOneOrganisation(id) {

    return new Promise ((resolve, reject) => {
       
        const data = {orgID: id}
        const query = "SELECT * FROM organisations where ?";
        mySQLConnection.query(query, data, (err, result) => {
            if(err) {
                reject();
            } else {
                resolve(result[0]);
            }
        });
    });
    
}


module.exports = router;