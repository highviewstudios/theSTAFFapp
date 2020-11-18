require('dotenv').config();
const express = require('express');
const mySQLConnection = require('../connection');
const generatePass = require('generate-password');
const bcrypt = require('bcrypt');
const email = require('../email');
const { uuid } = require('uuidv4');
const moment = require('moment');

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
                        from: '"My STAFF" <no-reply@my-staff.co.uk>', // sender address
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

router.post('/organisation/changeSeniorAdmin', async (req, res) => {

    const orgID = req.body.orgID;
    const newUUID = req.body.newUUID;

    const organisation = await getOneOrganisation(orgID);

    const result = await UpdateUserSARequest(newUUID, 'true');

    if(result == 'Success') {
        const newSenior = await GetUserByID(newUUID);
        console.log(newSenior);

        //Send email
        let mailOptions = {
            from: '"My STAFF" <no-reply@my-staff.co.uk>', // sender address
            to: newSenior.email, // list of receivers
            subject: "Change of Senior Admin Request", // Subject line
            template: 'changeSA',
            context: {
                name: newSenior.displayName,
                email: newSenior.email,
                orgName: organisation.name,
                POC_Name: organisation.POC_Name,
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
            error: 'null',
            message: 'Request sent successfully'
        }

        res.send(json);
    }
});

router.post('/organisation/getSARData', async (req, res) => {

    const orgID = req.body.orgID;

    const organisation = await getOneOrganisation(orgID);

    const json = {
        org: organisation
    }

    res.send(json);
});

router.post('/organisation/SAInvate', async (req, res) => {

    const orgID = req.body.orgID;
    const invate = req.body.invate;
    const newUserID = req.body.newUserID;

    if(invate == 'Accept') {

        //old user
        const organisation = await getOneOrganisation(orgID);
        const oldUser = await GetUserByEmail(organisation.POC_Email);
        await UpdateUserRole(oldUser.uuid, 'admin');

        //new user
        await UpdateUserRole(newUserID, 'seniorAdmin');
        const newUser = await GetUserByID(newUserID);
        await UpdateOrgPOCDetails(organisation.uuid, newUser.displayName, newUser.email);
        await UpdateUserSARequest(newUserID, '');

        //SEND TO OLD SA
        //Send email
        let mailOptions = {
            from: '"My STAFF" <no-reply@my-staff.co.uk>', // sender address
            to: oldUser.email, // list of receivers
            subject: "Change of Senior Admin Confirmed", // Subject line
            template: 'changeSAConfirmed',
            context: {
                name: oldUser.displayName,
                email: oldUser.email,
                newSA: newUser.displayName,
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

        //SEND TO HIGH-VIEW-STUIDOS
        //Send email
        let mailOptions2 = {
            from: '"My STAFF" <no-reply@my-staff.co.uk>', // sender address
            to: 'shaun.evans@high-view-studios.co.uk', // list of receivers
            subject: "Change of 'Point of Contact' Details", // Subject line
            template: 'changeOFPOC',
            context: {
                orgName: organisation.name,
                POC_Name: newUser.displayName,
                POC_Email: newUser.email,
            }
        };
        //send mail with defined transport object
        email.mail.sendMail(mailOptions2, (error, info) => {
                if(error) {
                    return console.log(error);
                }
            console.log("Message sent: %s", info.messageId);
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

            console.log("Email has been sent");
        });
        const json = {
            error: 'null',
            message: 'Senior Admin Updated',
            role: newUser.role
        }

        res.send(json);


    } else if(invate == 'Decline') {

        const organisation = await getOneOrganisation(orgID);
        const oldUser = await GetUserByEmail(organisation.POC_Email);
        await UpdateUserSARequest(newUserID, '');
        const newUser = await GetUserByID(newUserID);

        //Send email
        let mailOptions = {
            from: '"My STAFF" <no-reply@my-staff.co.uk>', // sender address
            to: oldUser.email, // list of receivers
            subject: "Change of Senior Admin Declied", // Subject line
            template: 'changeSADelined',
            context: {
                name: oldUser.displayName,
                email: oldUser.email,
                newSA: newUser.displayName,
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
            error: 'null',
            message: 'Senior Admin Request Declined'
        }

        res.send(json);
    }
});

router.get('/organisation/all', async (req, res) => {

    const organisations = await getAllOrganisations();

    res.send(organisations);
});

router.get('/organisation/:id', async (req, res) => {

    const id = req.params.id;

    const organisation = await getOneOrganisation(id);
    const holidays = await GetHolidays(id);
    const holidayTitles = await GetHolidayTitles(id);
    
    //Week System / Holidays
    for(const holiday of holidays) {

        if(holiday.titleUUID.includes('w')) {

            let id = '';
            const num = holiday.titleUUID.replace('w', '');

            if(num[0] == '0') {
                id = num[1];
            } else {
                id = num;
            }
            holiday.name = 'Week ' + id;
        }
        if(holiday.titleUUID.includes('h')) {

            let id = '';
            const num = holiday.titleUUID.replace('h', '');

            if(num[0] == '0') {
                id = num[1];
            } else {
                id = num;
            }

            for(const title of holidayTitles) {
                if(id == title.uuid) {
                    holiday.name = title.name;
                }
            }
        }
    }
    //Week System / Holidays^^^


    if(organisation != null) {
        const json = {
            userError: 'null',
            message: 'organisation found',
            organisation: organisation,
            layouts: await GetLayouts(id),
            rooms: await getOrganisationRooms(id),
            holidays: holidays
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

router.post('/organisation/getJustUser', async (req, res) => {

    const uuid = req.body.uuid;

    const user = await GetUserDetailsByID(uuid);

    let json ={};
    if(user == null) {
        json = {
            error: 'no user'
        }
    } else {
        json = {
            error: 'null',
            user: user
        }
    }

    res.send(json);
})

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

    await InsertDepartment(orgID, departmentName);

    let noOfDepartments = await GetNoOfDepartments(orgID);
    console.log(noOfDepartments);
    noOfDepartments++;
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
                    from: '"My STAFF" <no-reply@my-staff.co.uk>', // sender address
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

    const validateID = CheckOrgID(orgID);

    if(validateID) {

        const result = await RemoveUser(uuid);
        const result2 = await RemoveUserBookings(orgID, uuid);

        if(result == 'Success' && result2 == 'Success') {
            
            const users = await getAllOrganisationUsers(orgID);

            const json = {
                error: 'null',
                userError: 'null',
                message: 'User removed successfully',
                users: users
            }

            res.send(json);
        }
    } else {

        const json = {
            error: 'Yes',
            message: 'Invalid Data'
        }

        res.send(json);
    }
});

router.post('/organisation/addRoom', async (req, res) => {

    const orgID = req.body.orgID;
    const name = req.body.name;
    const layout = req.body.layout;
    const weekSystem = req.body.weekSystem.toString();

    const result = await InsertRoom(orgID, name, layout, weekSystem);

    if(result == 'Success') {

        let data = await GetRoomRedeemed(orgID);

        data.redeemedRooms++;
        await UpdateRoomRedeemed(data.redeemedRooms, orgID);

        const rooms = await getOrganisationRooms(orgID);

        const json = {
            error: 'null',
            message: 'Successfully added room',
            redeemedRooms: data.redeemedRooms,
            rooms: rooms
        }

        res.send(json);
    }

});

router.post('/organisation/updateRoom', async (req, res) => {

    const orgID = req.body.orgID;
    const uuid = req.body.uuid;
    const layout = req.body.layout;

    const result = await UpdateRoom(orgID, uuid, layout);

    if(result == 'Success') {

        const results = await getOrganisationRooms(orgID);

        const json = {
            message: 'Updated Room',
            rooms: results
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

    const orgID = req.body.orgID;
    const name = req.body.name;

    const result = await InsertNewLayoutName(orgID, name);

    if(result == 'Success') {

        const results = await GetLayouts(orgID);

        const json = {
            message: 'Successfully Added',
            layouts: results
        }

        res.send(json);
    }

})

router.post('/organisation/getLayouts', async (req, res) => {

    const orgID = req.body.orgID;

    const results = await GetLayouts(orgID);

    const json = {
        layouts: results
    }

    res.send(json);

});

router.post('/organisation/getTimetableSessions', async (req, res) => {

    const orgID = req.body.orgID;
    const layoutUUID = req.body.layoutUUID;

    const results = await GetTimetableSessions(orgID, layoutUUID);

    const json = {
        sessions: results
    }

    res.send(json);
})

router.post('/organisation/saveLayout', async (req, res) => {

    //Timetable - orgID, layout, sessionTotal, breakTotal, sessionOrder, days, sessions
    //Diary - orgID, layout, days, startTime, finishTime, timeInterval

    const orgID = req.body.orgID;
    const uuid = req.body.uuid;
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

        const result = await UpdateTimetableData(orgID, uuid, layout, sessionTotal, breakTotal, sessionOrder, days)

        if(result === 'Success') {
            const deletion = await RemoveOrgSessions(orgID, uuid);
            
            if(deletion === 'Success') {
                sessionOrder.map( async (session) => {
                    if(session.toString().includes('b')) {
                        await InsertTimetableBreak(orgID, uuid, sessions[session].id, sessions[session].breakText, sessions[session].textColor, sessions[session].bgColor);
                    } else {
                        await InsertTimetableSession(orgID, uuid, sessions[session].id, sessions[session].customText, sessions[session].hoverText);
                    }
                });
            }

            const results = await GetLayouts(orgID);
            
            const json = {
                message: 'Success',
                layouts: results
            }
            res.send(json);
        }
        
    }
    if(layout == 'Diary') {

        const result = await UpdateDiaryData(orgID, uuid, layout, days, startTime, finishTime, timeInterval);

        if(result == 'Success') {

            const results = await GetLayouts(orgID);

            const json = {
                message: 'Success',
                layouts: results
            }
            res.send(json);
        }
    }
});

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

    //const result = await CreateOrganisationBookingsTable("666");
    const result = await GetNoOfDepartments('0249217480');
    
    const json = {
        result: result
    }
    res.send(json);
});

//HOLIDAYS
router.post('/organisation/addHolidayTitle', async (req, res) => {

    const orgID = req.body.orgID;
    const title = req.body.title;

    const result = await InsertHolidayTitle(orgID, title);

    if(result == 'Success') {

        const titles = await GetHolidayTitles(orgID);

        const json = {
            error: 'null',
            message: 'Successfully added',
            titles: titles
        }

        res.send(json);
    }
});

router.post('/organisation/getHolidayData', async (req, res) => {

    const orgID = req.body.orgID;

    const holidayTitles = await GetHolidayTitles(orgID);
    const dates = await GetHolidayOrgData(orgID);
    const holidays = await GetHolidays(orgID);
    const org = await getOneOrganisation(orgID);
    let collideBookings = false

    if(org.locked == 'true') {
        const collides = await CheckForCollides(orgID);

        if(collides.length > 0) {
            collideBookings = true
        }
    }

    const json = {
        titles: holidayTitles,
        org: dates,
        holidays: holidays,
        locked: org.locked,
        collideBookings: collideBookings
    }

    res.send(json);
});

router.post('/organisation/renameHolidayTile', async (req, res) => {

    const orgID = req.body.orgID;
    const uuid = req.body.uuid;
    const title = req.body.title;

    const result = await UpdateHolidayTitle(uuid, title);

    if(result == 'Success') {

        const titles = await GetHolidayTitles(orgID);

        const json = {
            error: 'null',
            message: 'Successfully Updated',
            titles: titles
        }

        res.send(json);
    }
});

router.post('/organisation/deleteHolidayTitle', async (req, res) => {

    const orgID = req.body.orgID;
    const uuid = req.body.uuid;

    const result = await RemoveHolidayTitle(uuid);

    if(result == 'Success') {

        const titles = await GetHolidayTitles(orgID);

        const json = {
            error: 'null',
            message: 'Successfully Deleted',
            titles: titles
        }

        res.send(json);
    }
});

router.post('/organisation/saveHolidays', async (req, res) => {

    const orgID = req.body.orgID;
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;
    const holidays = req.body.holidays;
    const holidayWeeks = req.body.holidayWeeks;
    const weekSystem = req.body.weekSystem;
    const weeksNo = req.body.weeksNo;

    let collidedBookings = false;

    const validateID = CheckOrgID(orgID);

    if(validateID) {

        const result = await UpdateHolidayOrgDetails(startDate, endDate, weekSystem, weeksNo, orgID);

        if(result == 'Success') {

            const roomsWS = await GetRoomsWeekSystem(orgID);

            if(roomsWS.length > 0) {
                
                //HOLIDAYS\/\/\/\/
                //backup of holidays
                const Bholidays = await GetHolidays(orgID);

                for(const holiday of Bholidays) {
                    await BackupHolidayWeeks(holiday.weeks, holiday.uuid);
                }

                //clear all holiday data
                await ClearWeeksFromHolidays(orgID);

                //Update holidays or insert of new holidays
                for(const holiday of holidays) {

                    const week = await GetHoliday(orgID, holiday);

                    if(week != null) {
                        await UpdateHoliday(orgID, week.uuid, holidayWeeks[holiday]);
                    } else {
                        await InsertHolidayBackupNew(orgID, holiday, holidayWeeks[holiday]);
                    }
                }
                //HOLIDAYS/\/\/\/\

                //get repeat bookings from all rooms with week system enabled

                const rooms = await GetRoomsWeekSystem(orgID);
                const allBookings = await GetOrganisationRoomBookings(orgID, rooms);

                let vitrualRoom = [];
                let repeatBookings = [];

                for(const [id, booking] of allBookings.entries()) {
                    if(booking.bookingType == 'single') {
                        vitrualRoom.push(booking)
                    } else {
                        repeatBookings.push(booking);
                    }
                }

                for(const room of rooms) {

                    let bookings = [];

                    for(const booking of repeatBookings) {
                        if(booking.roomID == room.uuid) {
                            bookings.push(booking);
                        }
                    }

                    for(const booking of bookings) {

                        //Backup booking
                        const result = await BackupBooking(orgID, booking.uuid, booking.weeks, booking.sessions);

                        if(result == 'Success') {

                            //Find Week
                            let sysWeeks = '';
                            const date = moment(booking.startDate, 'DD/MM/YYYY');
                            const week = date.week() + '-' + date.format('YY');

                            for(const holiday of holidays) {
                                if(holidayWeeks[holiday].includes(week)) {
                                    sysWeeks = holidayWeeks[holiday];
                                }
                            }

                            //Find Sessions
                            let sessions = booking.sessions.split(',');
                            let bookingSessions = [];
                            for(let sess of sessions){
                                const temp = sess.split('-');
                                bookingSessions.push(temp[1])
                            }

                            let sortSessions = [];
                            for(const ses of bookingSessions) {
                                if(!sortSessions.includes(ses)) {
                                    sortSessions.push(ses);
                                }
                            }
                            
                            const layout = await GetSingleLayout(room.layout);

                            const dayList = layout.days.split(',');

                            let days = [];
                            for(const day of dayList) {
                                days.push((day == 'true'));
                            }

                            const weeksystem = (room.weekSystem == 'true');

                            //\/\/\/ if return TRUE - means no collides, if return FALSE - means collided with another booking
                            const results = CheckBookingAlters(booking.roomID, booking.bookingType, booking.repeatType, booking.startDate, booking.repeatUntil, sortSessions, days, weekSystem, sysWeeks, vitrualRoom);

                            if(results.check) {
                                //console.log('returns TRUE');
                                await UpdateBooking(orgID, booking.uuid, results.weeks, results.sessions, results.check, results.collideUUID);
                                vitrualRoom.push(booking);
                            } else {
                                //console.log('collided');
                                await UpdateBooking(orgID, booking.uuid, results.weeks, results.sessions, results.check, results.collideUUID);
                                collidedBookings = true;
                            }

                        }
                    }
                }

                //Change Organisation Data
                await UpdateOrganisationLock(orgID, 'true');
                const newHolidayData = await GetOrgHolidays(orgID);

                const json = {
                    error: 'null',
                    message: 'Successfully Updated Holidays',
                    locked: true,
                    collidedBookings: collidedBookings,
                    holidays: newHolidayData
                }

                res.send(json);
                
            } else {
                const result2 = await RemoveHolidays(orgID);

                if(result2 == 'Success') {

                    for(const holiday of holidays) {
                        await InsertHoliday(orgID, holiday, holidayWeeks[holiday]);
                    }

                    const newHolidayData = await GetHolidayOrgData(orgID);

                    const json = {
                        error: 'null',
                        message: 'Successfully Updated Holidays',
                        locked: false,
                        holidays: newHolidayData
                    }

                    res.send(json);
                }
            }
        }
    } else {

        const json = {
            error: 'Yes',
            userError: 'null',
            message: 'Invalid Data'
        }
        res.send(json);
    }
});

router.post('/organisation/getMainOrgWeekSystem', async (req, res) => {

    const orgID = req.body.orgID;

    let result = await GetMainOrgWeekSystem(orgID);
    
    if(result == '') {
        result = 'false';
    }

    const json = {
        weekSystem: result
    }

    res.send(json);
});

router.post('/organisation/geRoomsWeekSystem', async (req, res) => {

    const orgID = req.body.orgID;

    const result = await GetRoomsWeekSystem(orgID);

    let check;
    if(result.length == 0) {
        check = false;
    } else {
        check = true;
    }

    const json = {
        rooms: check
    }

    res.send(json);
});

router.get('/booktest', async(req, res) => {

    const rooms = [{uuid: 1}];

    const wk1 = '46-20';
    const wk2 = '42-20,43-20,45-20,47-20';

    const holidayWeeks = [wk1, wk2];

    let vitrualRoom = [];
    const bookings = await GetSampleBookings(rooms);

    for(const [id, booking] of bookings.entries()) {
        if(booking.bookingType == 'single') {
            vitrualRoom.push(booking)
            bookings.splice(id, 1);
        }
    }

    const days = [false, true, true, true, true, true, false]
    const weekSystem = true;

    //BOOKINGS \/\/\/
    for(const booking of bookings) {
        
        //Backup booking
        const result = await BackupBooking(booking.uuid, booking.weeks, booking.sessions);

        if(result == 'Success') {
            //Find Week
            let sysWeeks = '';
            const date = moment(booking.startDate, 'DD/MM/YYYY');
            const week = date.week() + '-' + date.format('YY');

            for(const holiday of holidayWeeks) {
                if(holiday.includes(week)) {
                    sysWeeks = holiday;
                }
            }

            //Find Sessions
            let sessions = booking.sessions.split(',');
            let bookingSessions = [];
            for(let sess of sessions){
                const temp = sess.split('-');
                bookingSessions.push(temp[1])
            }

            let sortSessions = [];
            for(const ses of bookingSessions) {
                if(!sortSessions.includes(ses)) {
                    sortSessions.push(ses);
                }
            }

            //\/\/\/ if return TRUE - means no collides, if return FALSE - means collided with another booking
            const results = await CheckBookingAlters(booking.roomID, booking.bookingType, booking.repeatType, booking.startDate, booking.repeatUntil, sortSessions, days, weekSystem, sysWeeks, vitrualRoom);

            if(results.check) {
                console.log('returns TRUE');
                await UpdateBooking(booking.uuid, results.weeks, results.sessions, results.check, results.collideUUID);
                vitrualRoom.push(booking);
            } else {
                console.log('collided');
                await UpdateBooking(booking.uuid, results.weeks, results.sessions, results.check, results.collideUUID);
            }
        }
    }
});

router.post('/organisation/restore', async (req, res) => {

    const orgID = req.body.orgID;

    const validateID = CheckOrgID(orgID);

    if(validateID) {

        const bookingBackups = await GetBookingsBackups(orgID);

        for(const backup of bookingBackups) {
            await RestoreBooking(orgID, backup.uuid, backup.bWeeks, backup.bSessions);
        }

        const holidayBackups = await GetHolidaysBackups(orgID);

        await DeleteCollideUUIDs(orgID);

        for(const backup of holidayBackups) {

            if(backup.backupType == 'new') {
                await RemoveHoliday(backup.uuid)
            } else {
            await RestoreHoliday(backup.uuid, backup.backup);
            }
        }

        //Change Organisation Data
        await UpdateOrganisationLock(orgID, '');
        const newHolidayData = await GetOrgHolidays(orgID);

        const json = {
            error: 'null',
            message: 'System Restored',
            locked: 'false',
            holidays: newHolidayData
        }

        res.send(json);
    } else {
        const json = {
            error: 'Yes',
            message: 'Invalid Data'
        }

        res.send(json);
    }
});

router.post('/organisation/collidedbookings', async (req, res) => {

    const orgID = req.body.orgID;

    const validateID = CheckOrgID(orgID);

    if(validateID) {

        let collideBookings = [];

        let bookings = await GetCollideBookings(orgID);

        for(const booking of bookings) {

            const collideUUIDs = booking.collideUUID.split(',');

            booking.user = await findUsersName(booking.user);

            for(const uuid of collideUUIDs) {
                
                let enter = true;
                let collidedBooking = await GetBookingCollidedWith(orgID, uuid);
                collidedBooking[0].user = await findUsersName(collidedBooking[0].user);

                for(const collide of collideBookings) {
                    if(collide.uuid == collidedBooking.uuid) {
                        enter = false;
                        break;
                    }
                }

                if(enter) {
                    collideBookings.push(collidedBooking[0]);
                }
            }
        }

        const sessions = await GetOrganisationTimetableSessions(orgID);

        const json = {
            error: 'null',
            bookings: bookings,
            collides: collideBookings,
            sessions: sessions
        }

        res.send(json);
    } else {

        const json = {
            error: 'Yes',
            message: 'Invalid Data'
        }

        res.send(json);
    }
});

router.post('/collide/deleteBooking', async (req, res) => {

    const orgID = req.body.orgID;
    const bookingUUID = req.body.bookingUUID;

    const validateID = CheckOrgID(orgID);

    if(validateID) {

        const result = await Collide_DeleteMainBooking(orgID, bookingUUID);

        if(result == 'Success') {

            const json = {
                error: 'null',
                message: 'Deleted main booking'
            }

            res.send(json);
        }
    } else {
        const json = {
            error: 'Yes',
            message: 'Invalid Data'
        }

        res.send(json);
    }
});

router.post('/collide/deleteCollide', async (req, res) => {

    const orgID = req.body.orgID;
    const bookingUUID = req.body.bookingUUID;
    const collideUUID = req.body.collideUUID;

    const validateID = CheckOrgID(orgID);

    if(validateID) {

        const booking = await GetBooking(orgID, bookingUUID);

        const collides = booking.collideUUID.split(',');

        let finishedCollies = [];
        for(const coll of collides) {
            if(coll != collideUUID) {
                finishedCollies.push(coll);
            }
        }

        await Collide_DeleteCollideBooking(orgID, collideUUID);

        let result = ''
        if(finishedCollies.length == 0) {
            result = await Collide_MainBookingClearCollide(orgID, bookingUUID);
        } else {
            result = await Collide_MainBookingUpdateCollides(orgID, bookingUUID, finishedCollies.toString());
        }

        if(result == 'Success') {

            const json = {
                error: 'null',
                message: 'Deleted collide booking'
            }

            res.send(json);
        }

    } else {
        const json = {
            error: 'Yes',
            message: 'Invalid Data'
        }

        res.send(json);
    }
});

router.post('/organisation/unlock', async (req, res) => {

    const orgID = req.body.orgID;

    const collides = await CheckForCollides(orgID);

    if(collides.length > 0) {

        const json = {
            error: 'Yes',
            message: 'You have still got collided bookings, please clear them before you unlock'
        }

        res.send(json);
    } else {

        const validateID = CheckOrgID(orgID);

        if(validateID) {

            const holidayBackups = await GetHolidaysBackups(orgID);

            for(const holiday of holidayBackups) {
                if(holiday.weeks == '') {
                    await DeleteHolidayData(holiday.uuid);
                } else {
                    await DeleteHolidayBackup(holiday.uuid);
                }
            }

            const deleteBookings = await GetCollideDeleteBookings(orgID);

            for(const del of deleteBookings) {
                await DeleteFromCollide(orgID, del.uuid);
            }

            await DeleteBookingsBackup(orgID);

            await UpdateOrganisationLock(orgID, '');

            const json = {
                error: 'null',
                locked: false,
                message: 'System Unlocked'
            }

            res.send(json);

        } else {
            const json = {
                error: 'Yes',
                message: 'Invalid Data'
            }
    
            res.send(json);
        }


    }
});

router.post('/organisation/getSALoginMethod', async (req, res) => {

    const email = req.body.email;

    const user = await GetUserByEmail(email);

    const json = {
        method: user.strategy
    }

    res.send(json);
});

router.post('/organisaation/changeASLoginMethod', async (req, res) => {

    const orgID = req.body.orgID
    const uEmail = req.body.email;
    const method = req.body.method;

    const user = await GetUserByEmail(uEmail);
    let password = '';
    let request = 'false'

    if(method == 'local') {
        password = generatePass.generate({length: 10, numbers: true, uppercase: true});
        request = 'true';
    }

    const result = await updateUserStrategy(user.uuid, method, password, request);

    if(result == 'Success') {

        await updateOrgAuthMethod(orgID, method);

        console.log(user.email)
                //Send email
                let mailOptions = {
                    from: '"My STAFF" <no-reply@my-staff.co.uk>', // sender address
                    to: user.email, // list of receivers
                    subject: "Your Login method has changed", // Subject line
                    template: 'ASChangeStrategy',
                    context: {
                        name: user.displayName,
                        email: user.email,
                        newMethod: method,
                        localPassword: password
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
            error: 'null',
            message: 'Strategy Updated'
        }

        res.send(json);
    }
});

router.post('/organisation/getUserLoginMethod', async (req, res) => {

    const uuid = req.body.uuid;

    const user = await GetUserByID(uuid);

    const json = {
        name: user.displayName,
        method: user.strategy
    }

    res.send(json);
});

router.post('/organisaation/changeUserLoginMethod', async (req, res) => {

    const orgID = req.body.orgID
    const uuid = req.body.uuid;
    const method = req.body.method;

    let refresh = ''
    if(method == 'google') {
        refresh = 'true';
    } else {
        refresh = 'false';
    }

    const user = await GetUserByID(uuid);

    let password = '';
    let request = 'false'

    if(method == 'local') {
        password = generatePass.generate({length: 10, numbers: true, uppercase: true});
        request = 'true';
    }

    const result = await updateUserStrategy(user.uuid, method, password, request, refresh);

    const organisation = await getOneOrganisation(orgID);

    if(result == 'Success') {

        //Send email
        let mailOptions = {
            from: '"My STAFF" <no-reply@my-staff.co.uk>', // sender address
            to: user.email, // list of receivers
            subject: "Your Login method has changed", // Subject line
            template: 'userChangeStrategy',
            context: {
                name: user.displayName,
                email: user.email,
                seniorAdmin: organisation.POC_Name,
                newMethod: method,
                localPassword: password
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
            error: 'null',
            message: 'Strategy Updated'
        }

        res.send(json);
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
        const tableColumns2 = "`linked` varchar(10) COLLATE utf8_unicode_ci NOT NULL, `linkID` varchar(10) COLLATE utf8_unicode_ci NOT NULL, `backupType` varchar(20) COLLATE utf8_unicode_ci NOT NULL, `collide` varchar(10) COLLATE utf8_unicode_ci NOT NULL, `collideUUID` varchar(10) COLLATE utf8_unicode_ci NOT NULL, `bWeeks` varchar(1000) COLLATE utf8_unicode_ci NOT NULL, `bSessions` varchar(100) COLLATE utf8_unicode_ci NOT NULL, PRIMARY KEY (`uuid`))";
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
        });


    });
}

function updateUserStrategy(uuid, strategy, password, request, refresh) {
    return new Promise(async (resolve, reject) => {

        let hashedPassword = ''
        if(strategy == 'local') {
            hashedPassword = await bcrypt.hash(password, parseInt(process.env.SALT));
        }

        const data = [{strategy: strategy, password: hashedPassword, requestedPassword: request, new: 'false', refreshID: refresh}, uuid];
        const UPDATE_QUERY = "UPDATE users SET ? WHERE uuid=?";
    
        mySQLConnection.query(UPDATE_QUERY, data, (err, results) => {
            if(err) {
                console.log(err);
                reject();
            } else {
                resolve('Success');
            }
        });
    
    });
}

function updateOrgAuthMethod(orgID, strategy) {
    return new Promise(async (resolve, reject) => {

        const UPDATE_QUERY = "UPDATE organisations SET ? WHERE orgID=?";
        let data = [];
        if(strategy == 'local') {
            data = [{auth_Local: 'true'}, orgID];
        } else if(strategy == 'google') {
            data = [{auth_Google: 'true'}, orgID];
        }
    
        mySQLConnection.query(UPDATE_QUERY, data, (err, results) => {
            if(err) {
                console.log(err);
                reject();
            } else {
                resolve('Success');
            }
        });
    
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

function GetUserByID(uuid) {
    return new Promise ((resolve, reject) => {
    
        const data = {uuid: uuid}
        const FIND_QUERY = "SELECT uuid, strategy, email, displayName, role FROM users WHERE ?";

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

function GetUserDetailsByID(uuid) {
    return new Promise ((resolve, reject) => {
    
        const data = {uuid: uuid}
        const FIND_QUERY = "SELECT uuid, strategy, email, displayName, role, departments FROM users WHERE ?";

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

function UpdateUserSARequest(uuid, request) {
    return new Promise((resolve, reject) => {

        const data = [{SArequest: request}, uuid];
        const UPDATE_QUERY = "UPDATE users SET ? WHERE uuid=?";
    
        mySQLConnection.query(UPDATE_QUERY, data, (err, results) => {
            if(err) {
                reject();
            } else {
                resolve('Success');
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

function InsertDepartment(orgID, departmentName) {
    return new Promise(async (resolve, reject) => {

        const data = {orgID: orgID, name: departmentName}
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

    const data = [{noOfDepartments: noOfDepartments}, orgID];
    const UPDATE_QUERY = "UPDATE organisations SET ? WHERE orgID=?";

    mySQLConnection.query(UPDATE_QUERY, data, (err, results) => {
        if(err) {
            console.log(err);
            reject();
        } else {
            resolve();
        }
    });
    })
}

function GetNoOfDepartments(orgID) {
    return new Promise((resolve, reject) => {

    const data = {orgID: orgID};
    const query = "SELECT noOfDepartments FROM organisations WHERE ?";

    mySQLConnection.query(query, data, (err, results) => {
        if(err) {
            console.log(err);
            reject();
        } else {
            resolve(results[0].noOfDepartments);
        }
    });
    })
}

function getOrganisationDepartments(orgID) {

    return new Promise ((resolve, reject) => {
       
        const data = {orgID: orgID}
        const query = "SELECT uuid, name FROM departments where ?";
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

function UpdateUserRole(uuid, role) {
    return new Promise((resolve, reject) => {

    const data = [{role: role}, uuid];
    const UPDATE_QUERY = "UPDATE users SET ? WHERE uuid=?";

    mySQLConnection.query(UPDATE_QUERY, data, (err, results) => {
        if(err) {
            reject(err);
        } else {
            resolve('Success');
        }
    });
    })
}

function UpdateOrgPOCDetails(uuid, POC_Name, POC_Email) {
    return new Promise((resolve, reject) => {

    const data = [{POC_Name: POC_Name, POC_Email: POC_Email}, uuid];
    const UPDATE_QUERY = "UPDATE organisations SET ? WHERE uuid=?";

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

function RemoveUserBookings(orgID, userUUID) {
    return new Promise(async (resolve, reject) => {

        const data = {user: userUUID}
        const query = "DELETE FROM " + orgID + "_bookings WHERE ?";
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
function InsertRoom(orgID, name, layout, weekSystem) {
    return new Promise(async (resolve, reject) => {

        const data = {orgID: orgID, name: name, layout, weekSystem: weekSystem}
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

function GetRoomRedeemed(orgID) {
    return new Promise((resolve, reject) => {

    const data = {orgID: orgID};
    const UPDATE_QUERY = "SELECT redeemedRooms FROM organisations WHERE ?";

    mySQLConnection.query(UPDATE_QUERY, data, (err, results) => {
        if(err) {
            console.log(err);
            reject();
        } else {
            resolve(results[0]);
        }
    });
    })
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
        const query = "SELECT uuid, layout, name, weekSystem FROM rooms where ?";
        mySQLConnection.query(query, data, (err, result) => {
            if(err) {
                reject();
            } else {
                resolve(result);
            }
        });
    });  
}

function UpdateRoom(orgID, uuid, layout) {
    return new Promise(async (resolve, reject) => {

        const data = [{layout: layout}, orgID, uuid]
        const query = "UPDATE rooms SET ? WHERE orgID=? AND uuid=?";

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

//LAYOUT FUNCTIONS
function GetLayouts(orgID) {
    return new Promise((resolve, reject) =>{

        const data = {orgID: orgID}
        const query = "SELECT uuid, name, layout, sessions, breaks, sessionOrder, days, startTime, finishTime, timeInterval FROM layouts WHERE ?";
        mySQLConnection.query(query, data, (err, result) => {
            if(err) {
                
                reject();
            } else {
                resolve(result);
            }
        })
    })
}

function GetSingleLayout(uuid) {
    return new Promise((resolve, reject) =>{

        const data = {uuid: uuid}
        const query = "SELECT uuid, name, layout, sessions, breaks, sessionOrder, days, startTime, finishTime, timeInterval FROM layouts WHERE ?";
        mySQLConnection.query(query, data, (err, result) => {
            if(err) {
                
                reject();
            } else {
                resolve(result[0]);
            }
        })
    })
}

function GetTimetableSessions(orgID, layoutUUID) {
    return new Promise((resolve, reject) =>{

        const data = [{orgID: orgID}, {layoutUUID: layoutUUID}];
        const query = "SELECT id, customText, hoverText, breakText, textColor, bgColor FROM timetableSessions WHERE ? AND ?";
        mySQLConnection.query(query, data, (err, result) => {
            if(err) {
                
                reject();
            } else {
                resolve(result);
            }
        })
    })
}

function GetOrganisationTimetableSessions(orgID) {
    return new Promise((resolve, reject) =>{

        const data = [{orgID: orgID}];
        const query = "SELECT layoutUUID, id, customText, hoverText, breakText, textColor, bgColor FROM timetableSessions WHERE ?";
        mySQLConnection.query(query, data, (err, result) => {
            if(err) {
                reject();
            } else {
                resolve(result);
            }
        })
    })
}

function InsertNewLayoutName(orgID, name) {
    return new Promise(async (resolve, reject) => {

        const data = {orgID: orgID, name: name}
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



function UpdateTimetableData(orgID, uuid, layout, sessionTotal, breakTotal, sessionOrder, days) {
    return new Promise(async (resolve, reject) => {

        const data = [{layout: layout, sessions: sessionTotal, breaks: breakTotal,sessionOrder: sessionOrder.toString(), days: days}, orgID, uuid]
        const query = "UPDATE layouts SET ? WHERE orgID=? AND uuid=?";

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

function RemoveOrgSessions(orgID, layoutUUID) {
    return new Promise(async (resolve, reject) => {

        const data = [{orgID: orgID}, {layoutUUID: layoutUUID}]
        const query = "DELETE FROM timetableSessions WHERE ? AND ?";
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

function InsertTimetableBreak(orgID, layoutUUID, id, breakText, textColor, bgColor) {
    return new Promise(async (resolve, reject) => {

        const data = {orgID: orgID, layoutUUID: layoutUUID, id: id, breakText: breakText, textColor: textColor, bgColor: bgColor}
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

function InsertTimetableSession(orgID, layoutUUID, id, customText, hoverText) {
    return new Promise(async (resolve, reject) => {

        const data = {orgID: orgID, layoutUUID: layoutUUID, id: id, customText: customText, hoverText: hoverText}
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

function UpdateDiaryData(orgID, uuid, layout, days, startTime, finishTime, timeInterval) {
    return new Promise(async (resolve, reject) => {

        const data = [{layout: layout, days: days, startTime: startTime, finishTime: finishTime, timeInterval: timeInterval}, orgID, uuid]
        const query = "UPDATE layouts SET ? WHERE orgID=? AND uuid=?";;
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

function InsertHolidayTitle(orgID, holidayTitle) {
    return new Promise(async (resolve, reject) => {

        const data = {orgID: orgID, name: holidayTitle}
        const query = "INSERT holidayTitles SET ?";
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

function GetHolidayTitles(orgID) {
    return new Promise(async (resolve, reject) => {

        const data = {orgID: orgID}
        const query = "SELECT uuid, name FROM holidayTitles WHERE ?";
        mySQLConnection.query(query, data, (err, result) => {
            if(err) {
                console.log(err);
                reject();
            } else {
                resolve(result);
            }
        })
    });
}

function UpdateHolidayTitle(uuid, title) {
    return new Promise(async (resolve, reject) => {

        const data = [{name: title}, uuid]
        const query = "UPDATE holidayTitles SET ? WHERE uuid=?";;
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

function RemoveHolidayTitle(uuid) {
    return new Promise(async (resolve, reject) => {

        const data = {uuid: uuid}
        const query = "DELETE FROM holidayTitles WHERE ?";
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

function UpdateHolidayOrgDetails(startDate, endDate, weekSystem, weeks, orgID) {
    return new Promise((resolve, reject) => {

    const UPDATE_QUERY = "UPDATE organisations SET ? WHERE orgID=?";
    const data = [{holidayStartDate: startDate, holidayEndDate: endDate, weekSystem: weekSystem, weeks: weeks}, orgID];

    mySQLConnection.query(UPDATE_QUERY, data, (err, results) => {
        if(err) {
            reject();
        } else {
            resolve('Success');
        }
    });
    })
}

function RemoveHolidays(orgID) {
    return new Promise(async (resolve, reject) => {

        const data = {orgID: orgID}
        const query = "DELETE FROM holidays WHERE ?";
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

function InsertHoliday(orgID, titleUUID, weeks) {
    return new Promise(async (resolve, reject) => {

        const data = {orgID: orgID, titleUUID: titleUUID, weeks: weeks}
        const query = "INSERT holidays SET ?";
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

function UpdateHoliday(orgID, uuid, weeks) {
    return new Promise(async (resolve, reject) => {

        const data = [{weeks: weeks}, orgID, uuid]
        const query = "UPDATE holidays SET ? WHERE orgID=? AND uuid=?";
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

function InsertHolidayBackupNew(orgID, titleUUID, weeks) {
    return new Promise(async (resolve, reject) => {

        const data = {orgID: orgID, titleUUID: titleUUID, weeks: weeks, backupType: 'new'}
        const query = "INSERT holidays SET ?";
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

function GetHolidayOrgData(orgID) {
    return new Promise(async (resolve, reject) => {

        const data = {orgID: orgID}
        const query = "SELECT holidayStartDate, holidayEndDate, weekSystem, weeks FROM organisations WHERE ?";
        mySQLConnection.query(query, data, (err, result) => {
            if(err) {
                console.log(err);
                reject();
            } else {
                resolve(result[0]);
            }
        })
    });
}

function GetHolidays(orgID) {
    return new Promise(async (resolve, reject) => {

        const data = {orgID: orgID}
        const query = "SELECT uuid, titleUUID, weeks FROM holidays WHERE ?";
        mySQLConnection.query(query, data, (err, result) => {
            if(err) {
                console.log(err);
                reject();
            } else {
                resolve(result);
            }
        })
    });
}

function GetHoliday(orgID, week) {
    return new Promise(async (resolve, reject) => {

        const data = [{orgID: orgID}, {titleUUID: week}]
        const query = "SELECT uuid FROM holidays WHERE ? AND ?";
        mySQLConnection.query(query, data, (err, result) => {
            if(err) {
                console.log(err);
                reject();
            } else {
                resolve(result[0]);
            }
        })
    });
}

function ClearWeeksFromHolidays(orgID) {
    return new Promise((resolve, reject) => {

        const data = [{weeks: ''}, orgID];
        const UPDATE_QUERY = "UPDATE holidays SET ? WHERE orgID=?";
    
        mySQLConnection.query(UPDATE_QUERY, data, (err, results) => {
            if(err) {
                reject();
            } else {
                resolve('Success');
            }
        });
        })
}

function GetMainOrgWeekSystem(orgID) {
    return new Promise(async (resolve, reject) => {
        console.log(orgID);
        const data = {orgID: orgID}
        const query = "SELECT weekSystem FROM organisations WHERE ?";
        mySQLConnection.query(query, data, (err, result) => {
            if(err) {
                console.log(err);
                reject();
            } else {
                resolve(result[0].weekSystem);
            }
        })
    });
}

function GetRoomsWeekSystem(orgID) {
    return new Promise(async (resolve, reject) => {

        const data = [{orgID: orgID}, {weekSystem: 'true'}]
        const query = "SELECT * FROM rooms WHERE ? AND ?";
        mySQLConnection.query(query, data, (err, result) => {
            if(err) {
                console.log(err);
                reject();
            } else {
                resolve(result);
            }
        })
    });
}

function CheckForCollides(orgID) {
    return new Promise(async (resolve, reject) => {

        const data = {collide: 'true'}
        const query = "SELECT * FROM " + orgID + "_bookings WHERE ?";
        mySQLConnection.query(query, data, (err, result) => {
            if(err) {
                console.log(err);
                reject();
            } else {
                resolve(result);
            }
        })
    });
}

function BackupHolidayWeeks(weeks, uuid) {
    return new Promise((resolve, reject) => {

    const data = [{backupType: 'backup', backup: weeks}, uuid];
    const UPDATE_QUERY = "UPDATE holidays SET ? WHERE uuid=?";

    mySQLConnection.query(UPDATE_QUERY, data, (err, results) => {
        if(err) {
            reject();
        } else {
            resolve('Success');
        }
    });
    })
}

function GetOrganisationRoomBookings(orgID, rooms) {
    return new Promise(async (resolve, reject) => {

        let query = "SELECT * FROM " + orgID + "_bookings WHERE";//...
        let data = '';
        
        for(const room of rooms) {

            if(data == '') {
                data += " `roomID`='" + room.uuid + "'";
            } else {
                data += " OR `roomID`='" + room.uuid + "'";
            }
        }
        query += data;

        mySQLConnection.query(query, (err, result) => {
            if(err) {
                console.log(err);
                reject();
            } else {
                resolve(result);
            }
        })
    });
}
function BackupBooking(orgID, uuid, weeks, sessions) {
    return new Promise(async (resolve, reject) => {

    const data = [{backupType: 'backup', bWeeks: weeks, bSessions: sessions}, uuid];
    const UPDATE_QUERY = "UPDATE " + orgID + "_bookings SET ? WHERE uuid=?";

    mySQLConnection.query(UPDATE_QUERY, data, (err, results) => {
        if(err) {
            reject();
        } else {
            resolve('Success');
        }
    });
    });
}

function UpdateBooking(orgID, uuid, weeks, sessions, collideTest, collideUUID) {
    return new Promise(async (resolve, reject) => {
        let data = [];

        if(!collideTest) {
            data = [{weeks: weeks, sessions: sessions, collide: 'true', collideUUID: collideUUID}, uuid];
        } else {
            data = [{weeks: weeks, sessions: sessions}, uuid];
        }
        
        const UPDATE_QUERY = "UPDATE " + orgID + "_bookings SET ? WHERE uuid=?";
    
        mySQLConnection.query(UPDATE_QUERY, data, (err, results) => {
            if(err) {
                console.log(err);
                reject();
            } else {
                resolve('Success');
            }
        });
        });
}

function CheckBookingAlters(roomID, bookingType, repeatType, startDate, finishDate, sessions, dayTitles, weekSystem, sysWeeks, vitrualRoom) {

        let daySessions = [];
        let weeks = [];

        
        if(bookingType == 'single') {

            const sDate = moment(startDate, 'DD/MM/YYYY');

            weeks.push(formatString(sDate.week()) + '-' + sDate.format('YY'));
            
            const sessionIndex = formatString(sDate.day()) + '-'; 
            const ses = sessions.split(',');

            for(const s of ses) {
                daySessions.push(sessionIndex+formatString(s));
            }

        } else if(bookingType == 'repeat') {

            if(repeatType == 'daily') {
                let sDate = moment(startDate, 'DD/MM/YYYY');
                const fDate = moment(finishDate, 'DD/MM/YYYY');
                let dayIndexes = [];
                while(sDate.isSameOrBefore(fDate)) {

                    if(weekSystem) {
                        
                        const week = formatString(sDate.week()) + '-' + sDate.format('YY');
                        if(sysWeeks.includes(week)) {

                            if(dayTitles[sDate.day()]) {
                                if(!dayIndexes.includes(sDate.day())) {
                                    dayIndexes.push(sDate.day());
                                }
                                if(!weeks.includes(week)){
                                    weeks.push(week);
                                }
                            }
                        }

                    } else {
                        if(dayTitles[sDate.day()]) {
                            if(!dayIndexes.includes(sDate.day())) {
                                dayIndexes.push(sDate.day());
                            }
                            const week = formatString(sDate.week()) + '-' + sDate.format('YY');
                            if(!weeks.includes(week)){
                                weeks.push(week);
                            }
                        }
                    }
                    sDate.add(1, 'd');
                }

                for(const day of dayIndexes) {
                    for(const sess of sessions) {
                        daySessions.push(formatString(day) + '-' + sess);
                    }
                }

            } else if(repeatType == 'weekly') {

                let sDate = moment(startDate, 'DD/MM/YYYY');
                const fDate = moment(finishDate, 'DD/MM/YYYY');
                const sessionIndex = formatString(sDate.day()) + '-';

                while(sDate.isSameOrBefore(fDate)) {

                    if(weekSystem) {
                        const week = formatString(sDate.week()) + '-' + sDate.format('YY');
                        if(sysWeeks.includes(week)) {
                            weeks.push(week);
                        }
                    } else {
                        weeks.push(formatString(sDate.week()) + '-' + sDate.format('YY'));
                    }

                    sDate.add(1, 'w');
                }

                for(const sess of sessions) {
                    
                    daySessions.push(sessionIndex + sess);
                }

            }
        }

        //RUN CHECK
        let check = true;
        let uuid = '';

        for(const week of weeks) {

            for(const day of daySessions) {

                for(const booking of vitrualRoom) {

                    if(booking.roomID == roomID && booking.weeks.includes(week) && booking.sessions.includes(day)) {
                        if(uuid == '') {
                            uuid = booking.uuid;
                        } else {
                            uuid += ',' + booking.uuid
                        }
                        check = false;
                    }
                }
            }
        }

        const json = {
            check: check,
            collideUUID: uuid,
            weeks: weeks.toString(),
            sessions: daySessions.toString()
        }

        return json;
}

function formatString(time) {
        
    if(time.toString().includes('b')) {
        time = time.replace('b', '');

        if(time.toString().length == 1) {
            return 'b0' + time;
        } else {
            return time;
        }
    } else {
        if(time.toString().length == 1) {
            return '0' + time;
        } else {
            return time;
        }
    }
}

// function RestoreBackup(orgID) {

//     const bookings = GetSampleBookings()
// }

function UpdateOrganisationLock(orgID, locked) {
    return new Promise(async (resolve, reject) => {

        const data = [{locked: locked}, orgID];
        const UPDATE_QUERY = "UPDATE organisations SET ? WHERE orgID=?";

        mySQLConnection.query(UPDATE_QUERY, data, (err, result) => {
            if(err) {
                console.log(err);
                reject();
            } else {
                resolve('Success');
            }
        });
    });
}

function GetBookingsBackups(orgID) {
    return new Promise(async (resolve, reject) => {
        
        const data = {backupType: 'backup'}
        const query = "SELECT * FROM " + orgID + "_bookings WHERE ?";
        //const query = "SELECT * FROM sample WHERE ?";

        mySQLConnection.query(query, data, (err, result) => {
            if(err) {
                console.log(err);
                reject();
            } else {
                resolve(result);
            }
        })
    });
}

function RestoreBooking(orgID, uuid, weeks, sessions) {
    return new Promise(async (resolve, reject) => {

        const data = [{weeks: weeks, sessions: sessions, backupType: '', collide: '', collideUUID: '', bWeeks: '', bSessions: ''}, uuid];
        const UPDATE_QUERY = "UPDATE " + orgID + "_bookings SET ? WHERE uuid=?";

        mySQLConnection.query(UPDATE_QUERY, data, (err, result) => {
            if(err) {
                console.log(err);
                reject();
            } else {
                resolve('Success');
            }
        });
    });
}

function DeleteCollideUUIDs(orgID) {
    return new Promise(async (resolve, reject) => {

        const data = {collide: ''};
        const UPDATE_QUERY = "UPDATE " + orgID + "_bookings SET ? WHERE collide='delete'";

        mySQLConnection.query(UPDATE_QUERY, data, (err, result) => {
            if(err) {
                console.log(err);
                reject();
            } else {
                resolve('Success');
            }
        });
    });
}

function GetHolidaysBackups(orgID) {
    return new Promise(async (resolve, reject) => {
        
        const data = [{orgID: orgID}, {backupType: 'backup'}, {orgID: orgID}, {backupType: 'new'}]
        const query = "SELECT * FROM holidays WHERE ? AND ? OR ? AND ?";

        mySQLConnection.query(query, data, (err, result) => {
            if(err) {
                console.log(err);
                reject();
            } else {
                resolve(result);
            }
        })
    });
}

function RestoreHoliday(uuid, weeks) {
    return new Promise(async (resolve, reject) => {

        const data = [{weeks: weeks, backupType: '', backup: ''}, uuid];
        const UPDATE_QUERY = "UPDATE holidays SET ? WHERE uuid=?";

        mySQLConnection.query(UPDATE_QUERY, data, (err, result) => {
            if(err) {
                console.log(err);
                reject();
            } else {
                resolve('Success');
            }
        });
    });
}

function DeleteHolidayBackup(uuid) {
    return new Promise(async (resolve, reject) => {

        const data = [{backupType: '', backup: ''}, uuid];
        const UPDATE_QUERY = "UPDATE holidays SET ? WHERE uuid=?";

        mySQLConnection.query(UPDATE_QUERY, data, (err, result) => {
            if(err) {
                console.log(err);
                reject();
            } else {
                resolve('Success');
            }
        });
    });
}

function DeleteHolidayData(uuid) {
    return new Promise(async (resolve, reject) => {

        const data = {uuid: uuid};
        const query = "DELETE FROM holidays WHERE ?";

        mySQLConnection.query(query, data, (err, result) => {
            if(err) {
                console.log(err);
                reject();
            } else {
                resolve('Success');
            }
        });
    });
}

function GetCollideBookings(orgID) {
    return new Promise(async (resolve, reject) => {
        
        const data = {collide: 'true'}
        const query = "SELECT * FROM " + orgID + "_bookings WHERE ?";

        mySQLConnection.query(query, data, (err, result) => {
            if(err) {
                console.log(err);
                reject();
            } else {
                resolve(result);
            }
        })
    });
}

function DeleteBookingsBackup(orgID) {
    return new Promise(async (resolve, reject) => {

        const data = [{backupType: '', bWeeks: '', bSessions: ''}, uuid];
        const UPDATE_QUERY = "UPDATE " + orgID + "_bookings SET ? WHERE backupType='backup'";

        mySQLConnection.query(UPDATE_QUERY, data, (err, result) => {
            if(err) {
                console.log(err);
                reject();
            } else {
                resolve('Success');
            }
        });
    });
}

function GetCollideDeleteBookings(orgID) {
    return new Promise(async (resolve, reject) => {
        
        const data = {collide: 'delete'}
        const query = "SELECT * FROM " + orgID + "_bookings WHERE ?";

        mySQLConnection.query(query, data, (err, result) => {
            if(err) {
                console.log(err);
                reject();
            } else {
                resolve(result);
            }
        })
    });
}

function DeleteFromCollide(orgID, uuid) {
    return new Promise(async (resolve, reject) => {

        const data = {uuid: uuid}
        const query = "DELETE FROM " + orgID + "_bookings WHERE ?";
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

function GetBookingCollidedWith(orgID, uuid) {
    return new Promise(async (resolve, reject) => {
        
        const data = {uuid: uuid}
        const query = "SELECT * FROM " + orgID + "_bookings WHERE ?";

        mySQLConnection.query(query, data, (err, result) => {
            if(err) {
                console.log(err);
                reject();
            } else {
                resolve(result);
            }
        })
    });
}

function Collide_DeleteMainBooking(orgID, uuid) {
    return new Promise(async (resolve, reject) => {
        
        const data = [{collide: 'delete', collideUUID: ''}, uuid];
        const query = "UPDATE " + orgID + "_bookings SET ? WHERE uuid=?";

        mySQLConnection.query(query, data, (err, result) => {
            if(err) {
                console.log(err);
                reject();
            } else {
                resolve('Success');
            }
        })
    });
}

function Collide_DeleteCollideBooking(orgID, uuid) {
    return new Promise(async (resolve, reject) => {
        
        const data = [{collide: 'delete'}, uuid];
        const query = "UPDATE " + orgID + "_bookings SET ? WHERE uuid=?";

        mySQLConnection.query(query, data, (err, result) => {
            if(err) {
                console.log(err);
                reject();
            } else {
                resolve('Success');
            }
        })
    });
}

function Collide_MainBookingClearCollide(orgID, uuid) {
    return new Promise(async (resolve, reject) => {
        
        const data = [{collide: '', collideUUID: ''}, uuid];
        const query = "UPDATE " + orgID + "_bookings SET ? WHERE uuid=?";

        mySQLConnection.query(query, data, (err, result) => {
            if(err) {
                console.log(err);
                reject();
            } else {
                resolve('Success');
            }
        })
    });
}

function Collide_MainBookingUpdateCollides(orgID, uuid, collides) {
    return new Promise(async (resolve, reject) => {
        
        const data = [{collideUUID: collides}, uuid];
        const query = "UPDATE " + orgID + "_bookings SET ? WHERE uuid=?";

        mySQLConnection.query(query, data, (err, result) => {
            if(err) {
                console.log(err);
                reject();
            } else {
                resolve('Success');
            }
        })
    });
}

function GetBooking(orgID, uuid) {
    return new Promise(async (resolve, reject) => {
        
        const data = {uuid: uuid}
        const query = "SELECT * FROM " + orgID + "_bookings WHERE ?";

        mySQLConnection.query(query, data, (err, result) => {
            if(err) {
                console.log(err);
                reject();
            } else {
                resolve(result[0]);
            }
        })
    });
}

function RemoveHoliday(uuid) {
    return new Promise(async (resolve, reject) => {

        const data = {uuid: uuid}
        const query = "DELETE FROM holidays WHERE ?";
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

//Test methods for CheckBookingAlters()
function GetSampleBookings(rooms) {
    return new Promise(async (resolve, reject) => {

        let query = "SELECT * FROM sample WHERE";//...
        let data = '';
        
        for(const room of rooms) {

            if(data == '') {
                data += " `roomID`='" + room.uuid + "'";
            } else {
                data += " OR `roomID`='" + room.uuid + "'";
            }
        }
        query += data;
        console.log(query);
        mySQLConnection.query(query, (err, result) => {
            if(err) {
                console.log(err);
                reject();
            } else {
                resolve(result);
            }
        })
    });
}

function CheckOrgID(orgID) {

    let check = true
    if(orgID.length != 10) {
        check = false;
    } else {
        if(!ValidateNumber(orgID)) {
            check = false;
        }
    }

    return check;
}

function ValidateNumber(number) 
{
    if (!/^\d+$/.test(number))
    {
        return false;
    } else {
        return true;
    }
}

function findUsersName(uuid) {
    return new Promise ((resolve, reject) => {
    
        const data = {uuid: uuid}
        const FIND_QUERY = "SELECT displayName FROM users WHERE ?";

        mySQLConnection.query(FIND_QUERY, data, (err, result) => {
            if(err) {
                console.log(err);
                reject();
            } else {
                resolve(result[0].displayName)
            }
        });
        })
}

function GetOrgHolidays(orgID) {
    return new Promise (async (resolve, reject) => {

        const holidays = await GetHolidays(orgID);
        const holidayTitles = await GetHolidayTitles(orgID);
        
        //Week System / Holidays
        for(const holiday of holidays) {

            if(holiday.titleUUID.includes('w')) {

                let id = '';
                const num = holiday.titleUUID.replace('w', '');

                if(num[0] == '0') {
                    id = num[1];
                } else {
                    id = num;
                }
                holiday.name = 'Week ' + id;
            }
            if(holiday.titleUUID.includes('h')) {

                let id = '';
                const num = holiday.titleUUID.replace('h', '');

                if(num[0] == '0') {
                    id = num[1];
                } else {
                    id = num;
                }

                for(const title of holidayTitles) {
                    if(id == title.uuid) {
                        holiday.name = title.name;
                    }
                }
            }
        }
    //Week System / Holidays^^^

        resolve(holidays);
    })
}

module.exports = router;