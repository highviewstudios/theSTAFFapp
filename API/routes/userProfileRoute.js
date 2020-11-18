const express = require('express');
const mySQLConnection = require('../connection');

const router = express.Router();

router.post('/createProfile', async (req, res) => {

    const orgID = req.body.orgID;
    const name = req.body.name;

    const result = await createUserProfile(orgID, name);

    if(result == 'Success') {

        const json = {
            error: 'null',
            message: 'Profile Created'
        }

        res.send(json);
    }
});

router.post('/getOrgProfiles', async (req, res) => {

    const orgID = req.body.orgID;

    const profiles = await GetOrgProfiles(orgID);
    const useProfiles = await GetUseProfiles(orgID);

    const json = {
        profiles: profiles,
        useProfiles: useProfiles
    }

    res.send(json);
});

router.post('/saveProfile', async (req, res) => {

    const orgID = req.body.orgID;
    const profileUUID = req.body.profileUUID;

    const usersToUpdate = req.body.usersToUpdate;

    const rooms = req.body.rooms;

    //USERS
    usersToUpdate.map( async user => {

        await UpdateUser(user.uuid, user.userProfiles);
    })

    //ROOMS

    rooms.map( async room => {

        const rm = await GetUPRoom(orgID, profileUUID, room.uuid);
        if(rm != null) {

            if(room.view) {
                UpdateRoomInUPRooms(orgID, profileUUID, room.uuid, room.view.toString(), room.write.toString(), room.edit.toString(), room.delete.toString(), room.repeat.toString());
            } else {
                DeleteRoomInUPRooms(rm.uuid);
            }
        } else {
            if(room.view) {
                InsertNewRoomInUPRooms(orgID, profileUUID, room.uuid, room.view.toString(), room.write.toString(), room.edit.toString(), room.delete.toString(), room.repeat.toString());
            }
        }
    });

    const json = {
        error: 'null',
        message: 'User Profile Updated'
    }

    res.json(json);
});

router.post('/loadProfile', async (req, res) => {

    const orgID = req.body.orgID;
    const profileUUID = req.body.profileUUID;

    //USERS
    const users = await getAllOrganisationUsers(orgID);

    //ROOMS AND THEIR PROPERTIES
    const UPRooms = await GetOrgUPRooms(orgID, profileUUID);
    const orgRooms = await getOrganisationRooms(orgID);

    const json = {
        error: 'null',
        users: users,
        UPRooms: UPRooms,
        orgRooms: orgRooms
    }
    
    res.send(json);

});

router.post('/useProfiles', async (req, res) => {

    const orgID = req.body.orgID;
    const use = req.body.use;

    const result = await UpdateUseProfiles(orgID, use);

    if(result == 'Success') {

        const json = {
            error: 'null',
            message: 'Updated useProfiles'
        }

        res.json(json);
    }
})

//FUNCTIONS
function createUserProfile(orgID, name) {

    return new Promise ((resolve, reject) => {
       
        const data = {orgID: orgID, name: name};
        const query = "INSERT INTO userProfiles SET ?";
        mySQLConnection.query(query, data, (err) => {
            if(err) {
                reject();
            } else {
                resolve("Success");
            }
        });
    }); 
}

function GetOrgProfiles(orgID) {
    return new Promise ((resolve, reject) => {
    
        const data = {orgID: orgID}
        const FIND_QUERY = "SELECT * FROM userProfiles WHERE ?";

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

function GetUseProfiles(orgID) {
    return new Promise ((resolve, reject) => {
    
        const data = {orgID: orgID}
        const FIND_QUERY = "SELECT useProfiles FROM organisations WHERE ?";

        mySQLConnection.query(FIND_QUERY, data, (err, result) => {
            if(err) {
                console.log(err);
                reject();
            } else {
                resolve(result[0].useProfiles);
            }
        });
        })
}

function UpdateUseProfiles(orgID, checked) {
    return new Promise((resolve, reject) => {

    const UPDATE_QUERY = "UPDATE organisations SET ? WHERE orgID=?";
    const data = [{useProfiles: checked.toString()}, orgID];

    mySQLConnection.query(UPDATE_QUERY, data, (err, results) => {
        if(err) {
            reject();
        } else {
            resolve('Success');
        }
    });
    })
}

function UpdateUser(uuid, profiles) {
    return new Promise((resolve, reject) => {

    const data = [{userProfiles: profiles}, {uuid: uuid}];
    const UPDATE_QUERY = "UPDATE users SET ? WHERE ?";

    mySQLConnection.query(UPDATE_QUERY, data, (err, results) => {
        if(err) {
            reject();
        } else {
            resolve('Success');
        }
    });
    })
}

function GetOrgUPRooms(orgID, profileUUID) {
    return new Promise ((resolve, reject) => {
    
        const data = [{orgID: orgID}, {userProfileUUID: profileUUID}]
        const FIND_QUERY = "SELECT roomUUID, prop_View AS 'view', prop_Write AS 'write', prop_Edit AS 'edit', prop_Delete AS 'delete', prop_Repeat as 'repeat' FROM UPRooms WHERE ? AND ?";

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

function GetUPRoom(orgID, profileUUID, roomUUID) {
    return new Promise ((resolve, reject) => {
    
        const data = [{orgID: orgID}, {userProfileUUID: profileUUID}, {roomUUID: roomUUID}]
        const FIND_QUERY = "SELECT * FROM UPRooms WHERE ? AND ? AND ?";

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

function InsertNewRoomInUPRooms(orgID, userProfileUUID, roomUUID, prop_View, prop_Write, prop_Edit, prop_Delete, prop_Repeat) {

    return new Promise ((resolve, reject) => {
       
        const data = {orgID: orgID, userProfileUUID: userProfileUUID, roomUUID: roomUUID, prop_View: prop_View, prop_Write: prop_Write, prop_Edit: prop_Edit, prop_Delete: prop_Delete, prop_Repeat: prop_Repeat};
        const query = "INSERT INTO UPRooms SET ?";
        mySQLConnection.query(query, data, (err) => {
            if(err) {
                console.log(err);
                reject();
            } else {
                resolve("Success");
            }
        });
    }); 
}

function UpdateRoomInUPRooms(orgID, userProfileUUID, roomUUID, prop_View, prop_Write, prop_Edit, prop_Delete, prop_Repeat) {
    return new Promise((resolve, reject) => {

    const data = [{prop_View: prop_View, prop_Write: prop_Write, prop_Edit: prop_Edit, prop_Delete: prop_Delete, prop_Repeat: prop_Repeat}, {orgID: orgID}, {userProfileUUID: userProfileUUID}, {roomUUID: roomUUID}];
    const UPDATE_QUERY = "UPDATE UPRooms SET ? WHERE ? AND ? AND ?";

    mySQLConnection.query(UPDATE_QUERY, data, (err, results) => {
        if(err) {
            reject();
        } else {
            resolve();
        }
    });
    })
}

function DeleteRoomInUPRooms(uuid) {
    return new Promise(async (resolve, reject) => {

        const data = {uuid: uuid}
        const query = "DELETE FROM UPRooms WHERE ?";
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

// COPIED FROM ORGANISATION ROUTE WITH SLIGHT DIFFERENCE
function getOrganisationRooms(orgID) {

    return new Promise ((resolve, reject) => {
       
        const data = {orgID: orgID}
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

function getAllOrganisationUsers(orgID) {
    return new Promise ((resolve, reject) => {
    
        const data = {orgID: orgID}
        const FIND_QUERY = "SELECT uuid, displayName, role, userProfiles FROM users WHERE ?";

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

module.exports = router;