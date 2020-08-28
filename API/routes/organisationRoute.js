require('dotenv').config();
const express = require('express');
const mySQLConnection = require('../connection');
const generatePass = require('generate-password');
const bcrypt = require('bcrypt');
const email = require('../email');
const { uuid } = require('uuidv4');

const router = express.Router();

router.post('/administrator/addOrganisation', async (req, res) => {
    
    const orgName = req.body.orgName;
    const orgRooms = req.body.orgRooms;
    const authLocal = req.body.authLocal;
    const authGoogle = req.body.authGoogle;
    const pName = req.body.pName;
    const pEmail = req.body.pEmail;

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
                const resultUser = await addUser(pName, pEmail, authLocal, password, '', "seniorAdmin", orgID);
                const resultTable = await CreateOrganisationBookingsTable(orgID);
        
                if(resultOrg == "Success" && resultUser == "Success" && resultTable == "Success") {

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
            organisation: organisation,
            layouts: await GetOrganisationLayouts(id),
            rooms: await getOrganisationRooms(id)
        }
        res.send(json);
    } else {
        const json = {
            userError: "Yes",
            message: 'organisation not found'
        }
        res.send(json);
    }
});

router.post('/organisation/updateLoginSettings', async (req, res) => {

    
    const orgID = req.body.orgID;
    const auth_local = req.body.auth_local;
    const auth_google = req.body.auth_google;
    const message = req.body.message;

    await UpdateLoginSettings(auth_local, auth_google, message, orgID);

    const json = {
        error: 'null',
        message: 'Login settings updated successfully'
    }

    res.send(json);
});

router.post('/organisation/updateUseDepartments', async (req, res) => {

    const orgID = req.body.orgID;
    const useDepartments = req.body.useDepartments;

    await UpdateUseDepartment(useDepartments, orgID);

    const json = {
        error: 'null',
        useDepartments: useDepartments
    }

    res.send(json);
});

router.post('/organisation/allDepartments', async (req, res) => {

    const orgID = req.body.orgID;

    const departments = await getOrganisationDepartments(orgID);

    const json = {
        departments: departments
    }

    res.send(json);
});

router.post('/organisation/addDepartment', async (req, res) => {

    const orgID = req.body.orgID;
    const departmentName = req.body.departmentName;
    let noOfDepartments = req.body.noOfDepartments;

    noOfDepartments++;

    await InsertDepartment(orgID, departmentName, noOfDepartments);
    await UpdateDepartmentNumber(noOfDepartments, orgID);
    const departments = await getOrganisationDepartments(orgID);

    const json = {
        error: 'null',
        noOfDepartments: noOfDepartments,
        departments: departments
    }

    res.json(json);
});

router.post('/organisatiton/removeDepartment', async (req, res) => {

    const orgID = req.body.orgID;
    const uuid = req.body.uuid;

    const result = await RemoveDepartment(uuid);

    if(result == 'Success') {

        const departments = await getOrganisationDepartments(orgID);

        const json = {
            message: 'department removed',
            departments: departments
        }
        res.send(json);
    }

})

router.post('/organisation/getUsers', async (req, res) => {

    const orgID = req.body.orgID;

    const users = await getAllOrganisationUsers(orgID);

    const json = {
        users: users
    }

    res.send(json);

});

router.post('/organisation/addUser', async (req, res) => {

    const orgID = req.body.orgID;
    const name = req.body.name;
    const pEmail = req.body.email;
    const role = req.body.role;
    const departments = req.body.departments;
    
    const organisation = await getOneOrganisation(orgID);

    if(!ValidateEmail(pEmail)) {
        const json = {
            error: "null",
            userError: "Yes",
            message: "The email address you have provided is not valid"
        }
        res.send(json);
    } else {
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
            const password = generatePass.generate({length: 10, numbers: true, uppercase: true});
            const result = await addUser(name, pEmail, organisation.auth_Local, password, departments, role, orgID);

            if(result == 'Success') {

                //Send email
                let mailOptions = {
                    from: '"My STAFF" <staff-development@high-view-studios.co.uk>', // sender address
                    to: pEmail, // list of receivers
                    subject: "Welcome to My STAFF", // Subject line
                    template: 'regUser',
                    context: {
                        name: name,
                        email: pEmail,
                        orgName: organisation.name,
                        authLocal: organisation.auth_Local,
                        authGoogle: organisation.auth_Google,
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

                const users = await getAllOrganisationUsers(orgID);

                const json = {
                    error: 'null',
                    userError: 'null',
                    message: 'User added successfully',
                    users: users
                }

                res.send(json);
            }
        }
    }
});

router.post('/organisation/updateUser', async (req, res) => {

    const uuid = req.body.uuid;
    const name = req.body.name;
    const email = req.body.email;
    const role = req.body.role;
    const departments = req.body.departments;
    const orgID = req.body.orgID;

    const result = await UpdateUser(uuid, name, email, role, departments);

    if(result == 'Success') {

        const users = await getAllOrganisationUsers(orgID);

                const json = {
                    error: 'null',
                    userError: 'null',
                    message: 'User updated successfully',
                    users: users
                }

                res.send(json);
    } else {
        console.log(result);
    }
});

router.post('/organisation/removeUser', async (req, res) => {

    const uuid = req.body.uuid;
    const orgID = req.body.orgID;

    const result = await RemoveUser(uuid);

    if(result == 'Success') {
        
        const users = await getAllOrganisationUsers(orgID);

        const json = {
            error: 'null',
            userError: 'null',
            message: 'User removed successfully',
            users: users
        }

        res.send(json);
    }
});

router.post('/organisation/addRoom', async (req, res) => {

    const orgID = req.body.orgID;
    let roomID = req.body.id;
    const name = req.body.name;
    const layout = req.body.layout;

    roomID++;
    const result = await InsertRoom(orgID, roomID, name, layout);

    if(result == 'Success') {

        await UpdateRoomRedeemed(roomID, orgID);
        const rooms = await getOrganisationRooms(orgID);

        const json = {
            error: 'null',
            message: 'Successfully added room',
            redeemedRooms: roomID,
            rooms: rooms
        }

        res.send(json);
    }

});

router.post('/organisation/getRooms', async (req, res) => {

    const orgID = req.body.orgID;

    const rooms = await getOrganisationRooms(orgID);

    const json = {
        rooms: rooms
    }

    res.send(json);
});

//LAYOUTS
router.post('/organisation/addLayout', async (req, res) => {

    //Timetable - orgID, layout, sessionTotal, breakTotal, sessionOrder, days, sessions
    //Diary - orgID, layout, days, startTime, finishTime, timeInterval

    const orgID = req.body.orgID;
    const layout = req.body.layout;
    const sessionTotal = req.body.sessionTotal;
    const breakTotal = req.body.breakTotal;
    const sessionOrder = req.body.sessionOrder;
    const days = req.body.days;

    const startTime = req.body.startTime;
    const finishTime = req.body.finishTime;
    const timeInterval = req.body.timeInterval;

    const sessions = req.body.sessions;

    if(layout == 'Timetable') {

        const timetable = await GetLayout(orgID, layout);
        let result = '';
        if(timetable != null) {
            result = await UpdateTimetableData(orgID, layout, sessionTotal, breakTotal, sessionOrder, days)
        } else {
            result = await InsertNewTimetableData(orgID, layout, sessionTotal, breakTotal, sessionOrder, days);
        }

        if(result === 'Success') {
            console.log('carry on...')
            const deletion = await RemoveOrgSessions(orgID);
            
            if(deletion === 'Success') {
                sessionOrder.map( async (session) => {
                    if(session.toString().includes('b')) {
                        await InsertTimetableBreak(orgID, sessions[session].id, sessions[session].breakText, sessions[session].textColor, sessions[session].bgColor);
                    } else {
                        await InsertTimetableSession(orgID, sessions[session].id, sessions[session].customText, sessions[session].hoverText);
                    }
                });
            }
            
            const json = {
                message: 'Success'
            }
            res.send(json);
        }
        
    }
    if(layout == 'Diary') {

        const diary = await GetLayout(orgID, layout);
        let result = '';
        if(diary != null) {
            console.log('Update')
            result = await UpdateDiaryData(orgID, layout, days, startTime, finishTime, timeInterval);
        } else {
            console.log('new');
            result = await InsertNewDiaryData(orgID, layout, days, startTime, finishTime, timeInterval);
        }

        if(result == 'Success') {
            const json = {
                message: 'Success'
            }
            res.send(json);
        }
    }
});

async function GetOrganisationLayouts(orgID){

    const layouts = await GetLayouts(orgID);
    const timetableSessions = await GetTimetableSessions(orgID);

    for(var i = 0; i < layouts.length; i++) {

        if(layouts[i].layout == 'Timetable') {

            delete layouts[i].startTime;
            delete layouts[i].finishTime;
            delete layouts[i].timeInterval;

        } else if(layouts[i].layout == "Diary") {

            delete layouts[i].sessions;
            delete layouts[i].breaks;
            delete layouts[i].sessionOrder;
        }
    }
    
    for(var i = 0; i < timetableSessions.length; i++) {

        if(timetableSessions[i].id.toString().includes('b')) {

            delete timetableSessions[i].customText;
            delete timetableSessions[i].hoverText;
        } else {
            delete timetableSessions[i].breakText;
            delete timetableSessions[i].textColor;
            delete timetableSessions[i].bgColor;
        }
    }

    const json = {
        layouts: layouts,
        sessions: timetableSessions
    }

    return json;
}

router.post('/organisation/usersAndDepartments', async (req, res) => {

    const orgID = req.body.orgID;
    const users = req.body.users;
    const departments = req.body.departments;

    let json = {}

    if(users) {
        const userList = await getAllOrganisationUsers(orgID);
        json['userList'] = userList;
    } else {
        json['userList'] = 'none';
    }

    if(departments) {
        const departmentList = await getOrganisationDepartments(orgID);
        json['departmentList'] = departmentList;
    } else {
        json['departmentList'] = 'none';
    }

    res.send(json);
})


router.get("/admin/test/", async (req, res) => {

    const result = await CreateOrganisationBookingsTable("666");
    
    const json = {
        result: result
    }
    res.send(json);
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

function CreateOrganisationBookingsTable(orgID) {
    return new Promise ((resolve, reject) => {
       
        const createTable = "CREATE TABLE `"+ orgID +"_bookings`"; 
        const tableColumns = "(`uuid` int(11) NOT NULL AUTO_INCREMENT, `roomID` varchar(10) COLLATE utf8_unicode_ci NOT NULL, `user` varchar(50) COLLATE utf8_unicode_ci NOT NULL, `departmentID` varchar(10) COLLATE utf8_unicode_ci NOT NULL, `sessionDes` varchar(50) COLLATE utf8_unicode_ci NOT NULL, `sessionTotal` varchar(10) COLLATE utf8_unicode_ci NOT NULL, `comments` varchar(100) COLLATE utf8_unicode_ci NOT NULL, `bookingType` varchar(20) COLLATE utf8_unicode_ci NOT NULL, `repeatType` varchar(10) COLLATE utf8_unicode_ci NOT NULL, `startDate` varchar(20) COLLATE utf8_unicode_ci NOT NULL, `repeatUntil` varchar(20) COLLATE utf8_unicode_ci NOT NULL, `weeks` varchar(700) COLLATE utf8_unicode_ci NOT NULL, `sessions` varchar(700) COLLATE utf8_unicode_ci NOT NULL, `dateCreated` varchar(20) COLLATE utf8_unicode_ci NOT NULL, `createdBy` varchar(50) COLLATE utf8_unicode_ci NOT NULL, `deletedSessions` varchar(100) COLLATE utf8_unicode_ci NOT NULL, ";
        const tableColumns2 = "`linked` varchar(10) COLLATE utf8_unicode_ci NOT NULL, `linkID` varchar(10) COLLATE utf8_unicode_ci NOT NULL, PRIMARY KEY (`uuid`))";
        const addTableEngine = "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci";

        const query = createTable + tableColumns + tableColumns2 + addTableEngine;
        mySQLConnection.query(query, (err) => {
            if(err) {
                console.log(err);
                reject("Failed");
            } else {
                resolve("Success");
            }
        });
    });
}

function addUser(name, email, authLocal, localPassword, departments, role, orgID) {
    return new Promise(async (resolve, reject) => {

        const uid = uuid();
        let hashedPassword = ''; 
        if(authLocal == "true") {
            hashedPassword = await bcrypt.hash(localPassword, parseInt(process.env.SALT));
        }

        const data = {id: uid, displayName: name, email: email, departments: departments, password: hashedPassword, requestedPassword: 'false', new: "true", role: role, orgID: orgID}
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

function getAllOrganisationUsers(orgID) {
    return new Promise ((resolve, reject) => {
    
        const data = {orgID: orgID}
        const FIND_QUERY = "SELECT uuid, displayName, role, departments, email FROM users WHERE ?";

        mySQLConnection.query(FIND_QUERY, data, (err, result) => {
            if(err) {
                console.log(err);
                reject();
            } else {
                resolve(result);
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

function UpdateLoginSettings(auth_local, auth_google, message, orgID) {
    return new Promise((resolve, reject) => {

    const UPDATE_QUERY = "UPDATE organisations SET ? WHERE orgID=?";
    const data = [{auth_Local: auth_local, auth_Google: auth_google, message: message}, orgID];

    mySQLConnection.query(UPDATE_QUERY, data, (err, results) => {
        if(err) {
            reject();
        } else {
            resolve();
        }
    });
    })
}


//DEPARTMENT SETTINGS
function UpdateUseDepartment(useDepartments, orgID) {
    return new Promise((resolve, reject) => {

    const UPDATE_QUERY = "UPDATE organisations SET ? WHERE orgID=?";
    const data = [{useDepartments: useDepartments}, orgID];

    mySQLConnection.query(UPDATE_QUERY, data, (err, results) => {
        if(err) {
            reject();
        } else {
            resolve();
        }
    });
    })
}

function InsertDepartment(orgID, departmentName, departmentNumber) {
    return new Promise(async (resolve, reject) => {

        const data = {orgID: orgID, id: departmentNumber, name: departmentName}
        const query = "INSERT departments SET ?";
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

function RemoveDepartment(uuid) {
    return new Promise(async (resolve, reject) => {

        const data = {uuid: uuid}
        const query = "DELETE FROM departments WHERE ?";
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

function UpdateDepartmentNumber(noOfDepartments, orgID) {
    return new Promise((resolve, reject) => {

    const UPDATE_QUERY = "UPDATE organisations SET ? WHERE orgID=?";
    const data = [{noOfDepartments: noOfDepartments}, orgID];

    mySQLConnection.query(UPDATE_QUERY, data, (err, results) => {
        if(err) {
            reject();
        } else {
            resolve();
        }
    });
    })
}

function getOrganisationDepartments(orgID) {

    return new Promise ((resolve, reject) => {
       
        const data = {orgID: orgID}
        const query = "SELECT id, name FROM departments where ?";
        mySQLConnection.query(query, data, (err, result) => {
            if(err) {
                reject();
            } else {
                resolve(result);
            }
        });
    });
    
}
//USER FUNCTIONS
function UpdateUser(uuid, name, email, role, departments) {
    return new Promise((resolve, reject) => {

    const UPDATE_QUERY = "UPDATE users SET ? WHERE uuid=?";
    const data = [{displayName: name, email: email, role: role, departments: departments}, uuid];

    mySQLConnection.query(UPDATE_QUERY, data, (err, results) => {
        if(err) {
            reject(err);
        } else {
            resolve('Success');
        }
    });
    })
}

function RemoveUser(uuid) {
    return new Promise(async (resolve, reject) => {

        const data = {uuid: uuid}
        const query = "DELETE FROM users WHERE ?";
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

//ROOMS FUNCTIONS
function InsertRoom(orgID, roomID, name,  layout) {
    return new Promise(async (resolve, reject) => {

        const data = {orgID: orgID, id: roomID, name: name, layout}
        const query = "INSERT rooms SET ?";
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

function UpdateRoomRedeemed(redeemedRooms, orgID) {
    return new Promise((resolve, reject) => {

    const UPDATE_QUERY = "UPDATE organisations SET ? WHERE orgID=?";
    const data = [{redeemedRooms: redeemedRooms}, orgID];

    mySQLConnection.query(UPDATE_QUERY, data, (err, results) => {
        if(err) {
            reject();
        } else {
            resolve();
        }
    });
    })
}

function getOrganisationRooms(id) {

    return new Promise ((resolve, reject) => {
       
        const data = {orgID: id}
        const query = "SELECT id, layout, name FROM rooms where ?";
        mySQLConnection.query(query, data, (err, result) => {
            if(err) {
                reject();
            } else {
                resolve(result);
            }
        });
    });  
}

//LAYOUT FUNCTIONS
function GetLayout(orgID, layout) {
    return new Promise((resolve, reject) =>{

        const data = [{orgID: orgID}, {layout: layout}]
        const query = "SELECT * FROM layouts WHERE ? AND ?";
        mySQLConnection.query(query, data, (err, result) => {
            if(err) {
                console.log(err);
                reject();
            } else {
                resolve(result[0]);
            }
        })
    })
}

function GetLayouts(orgID) {
    return new Promise((resolve, reject) =>{

        const data = {orgID: orgID}
        const query = "SELECT layout, sessions, breaks, sessionOrder, days, startTime, finishTime, timeInterval FROM layouts WHERE ?";
        mySQLConnection.query(query, data, (err, result) => {
            if(err) {
                
                reject();
            } else {
                resolve(result);
            }
        })
    })
}

function GetTimetableSessions(orgID) {
    return new Promise((resolve, reject) =>{

        const data = {orgID: orgID}
        const query = "SELECT id, customText, hoverText, breakText, textColor, bgColor FROM timetableSessions WHERE ?";
        mySQLConnection.query(query, data, (err, result) => {
            if(err) {
                
                reject();
            } else {
                resolve(result);
            }
        })
    })
}

function InsertNewTimetableData(orgID, layout, sessionTotal, breakTotal, sessionOrder, days) {
    return new Promise(async (resolve, reject) => {

        const data = {orgID: orgID, layout: layout, sessions: sessionTotal, breaks: breakTotal, sessionOrder: sessionOrder.toString(), days: days}
        const query = "INSERT layouts SET ?";
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

function UpdateTimetableData(orgID, layout, sessionTotal, breakTotal, sessionOrder, days) {
    return new Promise(async (resolve, reject) => {

        const data = [{sessions: sessionTotal, breaks: breakTotal,sessionOrder: sessionOrder.toString(), days: days}, orgID, layout]
        const query = "UPDATE layouts SET ? WHERE orgID=? AND layout=?";

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

function RemoveOrgSessions(orgID) {
    return new Promise(async (resolve, reject) => {

        const data = {orgID: orgID}
        const query = "DELETE FROM timetableSessions WHERE ?";
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

function InsertTimetableBreak(orgID, id, breakText, textColor, bgColor) {
    return new Promise(async (resolve, reject) => {

        const data = {orgID: orgID, id: id, breakText: breakText, textColor: textColor, bgColor: bgColor}
        const query = "INSERT timetableSessions SET ?";
        mySQLConnection.query(query, data, (err, result) => {
            if(err) {
                console.log(err);
                reject();
            } else {
                resolve();
            }
        })
    });
}

function InsertTimetableSession(orgID, id, customText, hoverText) {
    return new Promise(async (resolve, reject) => {

        const data = {orgID: orgID, id: id, customText: customText, hoverText: hoverText}
        const query = "INSERT timetableSessions SET ?";
        mySQLConnection.query(query, data, (err, result) => {
            if(err) {
                console.log(err);
                reject();
            } else {
                resolve();
            }
        })
    });
}

function InsertNewDiaryData(orgID, layout, days, startTime, finishTime, timeInterval) {
    return new Promise(async (resolve, reject) => {

        const data = {orgID: orgID, layout: layout, days: days, startTime: startTime, finishTime: finishTime, timeInterval: timeInterval}
        const query = "INSERT layouts SET ?";
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

function UpdateDiaryData(orgID, layout, days, startTime, finishTime, timeInterval) {
    return new Promise(async (resolve, reject) => {

        const data = [{days: days, startTime: startTime, finishTime: finishTime, timeInterval: timeInterval}, orgID, layout]
        const query = "UPDATE layouts SET ? WHERE orgID=? AND layout=?";;
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


module.exports = router;