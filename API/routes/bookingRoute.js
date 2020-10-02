const express = require('express');
const mySQLConnection = require('../connection');
const moment = require('moment');

const router = express.Router();

router.post('/createBooking', async (req, res) => {

    const orgID = req.body.orgID;
    const roomID = req.body.roomID;
    const user = req.body.user;
    const departmentID = req.body.departmentID;
    const sessionDes = req.body.sessionDes;
    const sessionTotal = req.body.sessionTotal;
    const comments = req.body.comments;
    const bookingType = req.body.bookingType;
    const repeatType = req.body.repeatType;
    const startDate = req.body.startDate;
    const repeatUntil = req.body.repeatUntil;
    const dateCreated = moment().format('DD/MM/YYYY');
    const createdBy = req.body.createdBy;
    const dayList = req.body.dayList;
    const weekSystem = req.body.weekSystem;
    const weekSysWeeks = req.body.weekSysWeeks;

    //deletedSessions

    let weeks = [];
    let days = [];

    const sessions = req.body.sessions; //not recorded in database as it is - joined up with days

    const validateID = CheckOrgID(orgID);

    if(validateID) {
        
        const result = await CheckBooking(orgID, roomID, bookingType, repeatType, startDate, repeatUntil, sessions, dayList, weekSystem, weekSysWeeks);

        if(result.length > 0) {
            const json = {
                error: 'null',
                userError: 'Yes',
                message: 'Your booking has collided with another booking' // meaning there are collides
            }
        
            res.send(json);
        } else {

            let sDate = moment(startDate, 'DD/MM/YYYY');

            if(bookingType == 'single') {
                
                weeks.push(formatString(sDate.week()) + "-" + sDate.format('YY'));
                
                const sess = sessions.split(',');
                const dayIndex = sDate.day();

                for(const s of sess) {
                    days.push(formatString(dayIndex) + '-' + formatString(s)); //format sessions
                }

            } else if(bookingType == 'repeat') {

                const fDate = moment(repeatUntil, 'DD/MM/YYYY');

                if(repeatType == 'daily') {

                    while(sDate.isSameOrBefore(fDate)) {

                        let con = false;
                        if(weekSystem) {

                            const week = formatString(sDate.week()) + '-' + sDate.format('YY');
                            if(weekSysWeeks.includes(week)) {
                                con = true;
                            }
                        } else {
                            con = true;
                        }

                        if(con) {
                            if(dayList[sDate.day()]) {

                                weeks.push(formatString(sDate.week()) + '-' + sDate.format('YY'));
    
                                const sess = sessions.split(',');
                                const dayIndex = sDate.day();
    
                                for(const s of sess) {
                                    days.push(formatString(dayIndex) + '-' + formatString(s)); 
                                }
                            }
                        }

                        sDate.add(1, 'd');
                    }
                } else if(repeatType == 'weekly') {

                    while(sDate.isSameOrBefore(fDate)) {

                        let con = false;
                        if(weekSystem) {

                            const week = formatString(sDate.week()) + '-' + sDate.format('YY');
                            if(weekSysWeeks.includes(week)) {
                                con = true;
                            }
                        } else {
                            con = true;
                        }

                        if(con){
                            weeks.push(formatString(sDate.week()) + '-' + sDate.format('YY'));

                            const sess = sessions.split(',');
                            const dayIndex = sDate.day();

                            for(const s of sess) {
                                days.push(formatString(dayIndex) + '-' + formatString(s)); 
                            }

                        }
                    
                        sDate.add(1, 'w');
                    }
                }
            }

            let sortWeeks = [];
            for(const week of weeks) {
                if(!sortWeeks.includes(week)) {
                    sortWeeks.push(week);
                }
            }

            let sortDays = [];
            for(const day of days) {
                if(!sortDays.includes(day)) {
                    sortDays.push(day);
                }
            }

            let len = [];
            let dayStrings = [];
            for(const sort of sortDays) {

                len.push(sort);
                if(len.toString().length > 700) {
                   const last = len.pop();
                   dayStrings.push(len.toString());
                   len = [];
                   len.push(last); 
                }
            }
            if(len.length > 0) {
                dayStrings.push(len.toString());
                len = [];
            }

            if(dayStrings.length == 1) {

                const result = await InsertBooking(orgID, roomID, user, departmentID, sessionDes, sessionTotal, comments, bookingType, repeatType, startDate, repeatUntil, sortWeeks.toString(), dayStrings[0], dateCreated, createdBy, 'No', '');

                if(result.result == 'Success') {
                    const json = {
                        error: 'null',
                        userError: 'null',
                        message: 'Session booked'
                    }
                
                    res.send(json);
                }

            } else {
                let uuid = '';
                let result;
                for(const [index, days] of dayStrings.entries()) {

                    if(index == 0) {
                        result = await InsertBooking(orgID, roomID, user, departmentID, sessionDes, sessionTotal, comments, bookingType, repeatType, startDate, repeatUntil, sortWeeks.toString(), days, dateCreated, createdBy, 'Yes', '');
                        //console.log(result.uuid);
                        uuid = result.uuid;
                    } else {
                        result = await InsertBooking(orgID, roomID, user, departmentID, sessionDes, sessionTotal, comments, bookingType, repeatType, startDate, repeatUntil, sortWeeks.toString(), days, dateCreated, createdBy, 'Yes', uuid);
                    }
                }

                if(result.result == 'Success') {
                    const json = {
                        error: 'null',
                        userError: 'null',
                        message: 'Session booked'
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

router.get('/test', async (req, res) => {
    
    // const m = moment();
    // const d1 = moment(m);
    // d1.add(1, 'd');
    // const d3 = moment(m);
    // d3.add(3, 'd')
    // //m.subtract(1, 'd');
    // //m.startOf('week')
    // const week = m.week();
    // const day = m.day();
    // const month = m.month();

    const name = await findUsersName('1');

    const json = {
        test: 'active',
        name: name
    }

    res.send(json);

});

let query;

router.get('/check', async (req, res) => {

    const bookingType = 'repeat';
    const repeatType = 'weekly';
    const startDate = moment('07/09/2020', 'DD/MM/YYYY');
    const endDate = moment('21/09/2020', 'DD/MM/YYYY');
    const sessions = '1';
    const days = [false, true, true, true, true, true, false]
    const weekSystem = false;
    const sysWeeks = '38-20,40-20,42-20,45-20,47-20,49-20';

    //send down the week number

    const bookingDetails = {bookingType, repeatType, startDate: startDate.format('DD/MM/YYYY'), endDate: endDate.format('DD/MM/YYYY'), sessions, sysWeeks, weekSystem, days}

    const result = await CheckBooking('0249217480', '2', bookingType, repeatType, startDate, endDate, sessions, days, weekSystem, sysWeeks);

    let check = false;
    if(result.length == 0) {
        check = false;
    } else {
        check = true;
    }

    const json = {
        checking: 'In Progress',
        bookingDetails,
        query,
        result,
        check
    }

    res.send(json);

});

router.post('/getBookings', async (req, res) => {

    const orgID = req.body.orgID;
    const room = req.body.room; 
    const week = req.body.week;
    const days = req.body.days;
    const weekBG = moment(req.body.weekBG, 'DD/MM/YYYY');

    const validateID = CheckOrgID(orgID);

    if(validateID) {

        let query = 'SELECT uuid, user, departmentID, bookingType, startDate, repeatUntil, weeks, sessions FROM ' + orgID + '_bookings WHERE';//...
        let data = ''
        for(const day of days) {

            if(data == '') {
                data = " `roomID`='"+ room +"' AND weeks LIKE '%"+week+"%' AND sessions LIKE '%"+day+"%' AND collide=''";
            } else {
                data += " OR `roomID`='" + room +"' AND weeks LIKE '%"+week+"%' AND sessions LIKE '%"+day+"%' AND collide=''";
            }
        }

        query += data;
        
        let results = await GetBookings(query);
        
        for(result of results) {
            result.user = await findUsersName(result.user);
        }

        let finalData = {};
        const emptySlot = {uuid: '', user: '', department: '', type: ''};

        for(const day of days) {
            const id = week + '-' + day;
            finalData[id] = emptySlot;
            
            results.forEach((result) => {
                if(result.weeks.includes(week) && result.sessions.includes(day)) {
                    let slot = {};

                    if(result.bookingType == 'repeat') {
                        
                        const sDate = moment(result.startDate,'DD/MM/YYYY');
                        const fDate = moment(result.repeatUntil, 'DD/MM/YYYY');
                        
                        const dayBreak = day.split('-');

                        const date = moment(weekBG);
                        date.add(dayBreak[0], 'd');

                        if(date.isBetween(sDate, fDate, undefined, '[]')) {
                            slot = {uuid: result.uuid,user: result.user, department: result.departmentID, type: result.bookingType}; 
                        } else {
                            slot = emptySlot;
                        }
                    } else {
                        slot = {uuid: result.uuid, user: result.user, department: result.departmentID, type: result.bookingType}; 
                    }
                    
                    finalData[id] = slot;
                }
            });
        }

        const json = {
            error: 'null',
            bookings: finalData
        }

        res.send(json);

    } else {
        const json = {
            error: 'Invalid Data'
        }
        res.send(json);
    }

});

router.post('/deleteBooking', async (req, res) => {

    const orgID = req.body.orgID;
    const bookingID = req.body.bookingID;

    const validateID = CheckOrgID(orgID);

    if(validateID) {

        const result = DeleteBooking(orgID, bookingID);

        if(result) {
            
            const json = {
                error: 'null',
                message: 'Booking Deleted'
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

//FUNCTIONS

function GetBookings(query) {

    return new Promise ((resolve, reject) => {

    mySQLConnection.query(query, (err, result) => {
        if(err) {
            console.log(err);
            reject('failed');
        } else {
            resolve(result);
        }
    });
    });
}

function CheckBooking(orgID, roomID, bookingType, repeatType, startDate, finishDate, sessions, dayTitles, weekSystem, sysWeeks) {

    return new Promise ((resolve, reject) => {

    query = "Select * FROM " + orgID + "_bookings WHERE";//...
    //query = "Select * FROM sample WHERE";//...
    let data = ''
    if(bookingType == 'single') {

        const sDate = moment(startDate, 'DD/MM/YYYY');

        const dateIndex = formatString(sDate.week()) + '-' + sDate.format('YY');
        const sessionIndex = formatString(sDate.day()) + '-'; 

        const ses = sessions.split(',');


        for(const s of ses) {

            if(data == '') {
                data = " `roomID`='"+ roomID +"' AND weeks LIKE '%"+dateIndex+"%' AND sessions LIKE '%"+sessionIndex+formatString(s)+"%'";
            } else {
                data += " OR `roomID`='" + roomID +"' AND weeks LIKE '%"+dateIndex+"%' AND sessions LIKE '%"+sessionIndex+formatString(s)+"%'";
            }
        }

        query = query + data;
    } else if(bookingType == 'repeat') {

        if(repeatType == 'daily') {

            let sDate = moment(startDate, 'DD/MM/YYYY');
            const fDate = moment(finishDate, 'DD/MM/YYYY');
            let dayIndexes = [];
            let weeks = [];
            while(sDate.isSameOrBefore(fDate)) {

                if(weekSystem) {

                    const week = formatString(sDate.week()) + '-' + sDate.format('YY');
                    if(sysWeeks.includes(week)) {

                        if(dayTitles[sDate.day()]) {
                            dayIndexes.push(sDate.day());
                            weeks.push(formatString(sDate.week()) + '-' + sDate.format('YY'));
                        }
                    }

                } else {
                    if(dayTitles[sDate.day()]) {
                        dayIndexes.push(sDate.day());
                        weeks.push(formatString(sDate.week()) + '-' + sDate.format('YY'));
                    }
                }

                sDate.add(1, 'd');
            }

            const ses = sessions.split(',');

            for(const [index, day] of dayIndexes.entries()) {

                for(const s of ses) {

                    const sessionIndex = formatString(day) + '-' + formatString(s);

                    if(data == '') {
                        data = " `roomID`='"+ roomID +"' AND weeks LIKE '%"+weeks[index]+"%' AND sessions LIKE '%"+sessionIndex+"%'";
                    } else {
                        data += " OR `roomID`='"+ roomID +"' AND weeks LIKE '%"+weeks[index]+"%' AND sessions LIKE '%"+sessionIndex+"%'";
                    }
                }
            }

            query += data;

        } else if( repeatType == 'weekly') {

            let sDate = moment(startDate, 'DD/MM/YYYY');
            const sessionIndex = formatString(sDate.day()) + '-';
            const fDate = moment(finishDate, 'DD/MM/YYYY');
            let weeks = [];
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

            const ses = sessions.split(',');
            
            for(const week of weeks) {

                for(const s of ses) {
                    if(data == '') {
                        data = " `roomID`='"+ roomID +"' AND weeks LIKE '%"+week+"%' AND sessions LIKE '%"+sessionIndex+formatString(s)+"%'";
                    } else {
                        data += " OR `roomID`='"+ roomID +"' AND weeks LIKE '%"+week+"%' AND sessions LIKE '%"+sessionIndex+formatString(s)+"%'";
                    }
                }
            }

            query = query + data;
        }
    }
    //resolve();
    //RUN QUERY
    mySQLConnection.query(query, (err, result) => {
        if(err) {
            console.log(err);
            reject('failed');
        } else {
            resolve(result);
        }
    });
     });
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

function InsertBooking(orgID, roomID, user, departmentID, sessionDes, sessionTotal, comments, bookingType, repeatType, startDate, repeatUntil, weeks, sessions, dateCreated, createdBy, linked, linkID) {

    return new Promise ((resolve, reject) => {
        try {
        const data = {roomID: roomID, user: user, departmentID: departmentID, sessionDes: sessionDes, sessionTotal: sessionTotal, comments: comments, bookingType: bookingType, repeatType: repeatType, startDate: startDate, repeatUntil: repeatUntil, weeks: weeks, sessions: sessions, dateCreated: dateCreated, createdBy: createdBy, linked: linked, linkID, linkID};
        const query = "INSERT INTO " + orgID + "_bookings SET ?";
        mySQLConnection.query(query, data, (err, result) => {
            if(err) {
                const json = {
                    result: 'Error',
                    uuid: 'null'
                }
                reject(json);
            } else {
                const json = {
                    result: 'Success',
                    uuid: result.insertId
                }
                resolve(json);
            }
        });
        } catch(err) {
            console.log(err);
        }
    });
    
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

function DeleteBooking(orgID, uuid) {
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

module.exports = router;