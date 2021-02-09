import Axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Col, Container, Jumbotron, ListGroup, Row, Modal, Image, Form } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { setUserSettings, updateSetting, updateAdminSetting } from '../../globalSettings/userProfileSettings';

import helpImg from '../../public/images/help.png';

function ProfileSettings(props) {

    const orgID = props.match.params.id;

    const UserProfileAdminGlobalSettings = useSelector(state => state.UserProfileAdminGlobalSettings);
    const AdminProfileGlobalSettings = useSelector(state => state.AdminProfileGlobalSettings);
    const history = useHistory();
    const dispatch = useDispatch();

    useEffect(() => {
        if(AdminProfileGlobalSettings.uuid == '') {
            console.log(AdminProfileGlobalSettings.uuid);
            history.push('/org/' + orgID + '/organisationAdmin');
        } else {
            if(AdminProfileGlobalSettings.uuid != 'default') {
                loadProfile(false);
            } else {
                setSettings(prevState => {
                    return {...prevState, defaultPro: true}
                });
                loadProfile(true);
            }
        }
    }, []);

    useEffect(() => {
        
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        }
    }, []);

    function handleResize() {

        let viewBtnSize = document.getElementById('viewBtn').offsetWidth; //50
        let writeBtnSize = document.getElementById('writeBtn').offsetWidth; //60
        let editBtnSize = document.getElementById('editBtn').offsetWidth; //50
        let deleteBtnSize = document.getElementById('deleteBtn').offsetWidth; //70
        let repeatBtnSize = document.getElementById('repeatBtn').offsetWidth; //70

        setSettings(prevState => {
            return {...prevState, viewBtnSize: viewBtnSize, writeBtnSize: writeBtnSize, editBtnSize: editBtnSize, deleteBtnSize: deleteBtnSize, repeatBtnSize: repeatBtnSize}
        });

    }

    const [settings, setSettings] = useState({
        users: [],
        userUUID: '',
        nonProfileUsers: [],
        profileUsers: [],
        rooms: [],
        defaultPro: false,

        viewBtnSize: 0,
        writeBtnSize: 0,
        editBtnSize: 0,
        deleteBtnSize: 0,
        repeatBtnSize: 0
    });

    const [userHistory, setHistory] = useState({
        users: []
    });

    const [modal, setModal] = useState({
        open: false,
        heading: '',
        message: ''
    });

    function handleCloseModal() {
        setModal(prevState => {
            return {...prevState, open: false}
        })
    }

    const [help, setHelp] = useState({
        open: false,
        heading: '',
        message: '',
        message2: '',
    });

    function handleCloseHelp() {
        setHelp(prevState => {
            return {...prevState, open: false}
        })
    }

    const [tabs, setTabs] = useState({
        bookings: true,
        admin: false
    })

    function loadProfile(defaultPro) {

        const data = {orgID: orgID, profileUUID: AdminProfileGlobalSettings.uuid, userSettingKeys: Object.keys(UserProfileAdminGlobalSettings.settings)}
        Axios.post('/userProfile/loadProfile', data)
        .then(res => {
            const data = res.data;

            //USERS
            getProfileUsers(defaultPro, data.users);

            //ROOMS
            const UPRooms = data.UPRooms;
            const orgRooms = data.orgRooms;
            
            let rooms = [];

            if(!defaultPro) {
                orgRooms.map(room => {
                    
                    let exsit = false;

                    UPRooms.map(UPRoom => {

                        if(room.uuid == UPRoom.roomUUID) {
                            
                            exsit = true;
                            const obj = {uuid: room.uuid, name: room.name, view: (UPRoom.view == 'true'), write: (UPRoom.write == 'true'), edit: (UPRoom.edit == 'true'), delete: (UPRoom.delete  == 'true'), repeat: (UPRoom.repeat == 'true')}
                            rooms.push(obj);
                        }
                    })

                    if(!exsit){

                        const roomObj = {uuid: room.uuid, name: room.name, view: false, write: false, edit: false, delete: false, repeat: false}
                        rooms.push(roomObj);
                    }
                })

                setSettings(prevState => {
                    return {...prevState, rooms: rooms};
                });

                //USER SETTINGS
                let settings = {};
                const serverSettings = data.userSettings;
                const keys = Object.keys(serverSettings);
                
                for(const key of keys) {
                    settings[key] = (serverSettings[key] == 'true');
                }
                setUserSettings(dispatch, settings);

            } else {
                orgRooms.map(room => {
                    const roomObj = {uuid: room.uuid, name: room.name, view: true, write: true, edit: false, delete: false, repeat: false}
                        rooms.push(roomObj);
                });

                setSettings(prevState => {
                    return {...prevState, rooms: rooms};
                });
            }

            handleResize();
        })
        .catch(err => {
            console.log(err)
        })
    }

    function getProfileUsers(defaultPro, allUsers) {

        let nonProfileusers = [];
        let profileUsers = [];

        if(!defaultPro) {
            allUsers.map(user => {
            
                const profiles = user.userProfiles.split(',');
                if(profiles.includes(AdminProfileGlobalSettings.uuid.toString())) {
                    profileUsers.push(user);
                } else {
                    nonProfileusers.push(user);
                }
            });

            setSettings(prevState => {
                return {...prevState, nonProfileUsers: nonProfileusers, profileUsers: profileUsers, users: allUsers, userUUID: ''}
            });
        } else {
            allUsers.map(user => {

                if(user.userProfiles == '') {
                    profileUsers.push(user);
                }
            });

            setSettings(prevState => {
                return {...prevState, profileUsers: profileUsers, users: allUsers, userUUID: ''}
            });
        }
    }


    function handleRoomSelectProperty(uuid, property) {

        const rms = settings.rooms;

        rms.forEach(room => {
            if(room.uuid == uuid) {
                if(room[property]) { //turns to false
                    room[property] = false;

                    if(property == 'view') {
                        room.write = false;
                        room.edit = false;
                        room.delete = false;
                        room.repeat = false;
                    }

                } else { //turns to true
                    room[property] = true;
                }
            }
        });

        setSettings(prevState => {
            return {...prevState, rooms: rms}
        });
    }

    function handleUpdateProfile() {

        const usersToUpdate = [];

        userHistory.users.map(id => {

            settings.users.map(user => {

                if(user.uuid == id) {

                    usersToUpdate.push(user);
                }
            })
        });

        const data = {orgID: orgID, profileUUID: AdminProfileGlobalSettings.uuid, usersToUpdate: usersToUpdate, profileUserCount: settings.profileUsers.length, rooms: settings.rooms, userSettings: UserProfileAdminGlobalSettings.settings};

        Axios.post('/userProfile/saveProfile', data)
        .then(res => {
            const data = res.data;
            if(data.message == 'User Profile Updated') {
                setModal({heading: 'Profile Settings', message: data.message, open: true});
            }
        })
        .catch(err => {
            console.log(err);
        })
    }

    function handleSelectAllViews() {
        console.log('select all views');
    }

    //USERS
    function handleUserClicked(uuid) {

        setSettings(prevState => {
            return {...prevState, userUUID: uuid}
        });
    }

    function handleMoveUserIntoProfile() {

        if(settings.userUUID == '') {
            setModal({heading: 'Move User', message: 'You need to select an user first', open: true})
        } else {
            settings.users.map(user => {

                if(user.uuid == settings.userUUID) {

                    let profiles = [];

                    if(user.userProfiles != '') {
                        profiles = user.userProfiles.split(',');
                    }

                    if(profiles.length > 5) {
                        setModal({heading: 'Move User', message: 'This user has already got 5 profile assigned to them', open: true});
                    } else {

                        if(profiles.length == 0) {
                            profiles.push(AdminProfileGlobalSettings.uuid);
                        } else {
                            profiles.push(AdminProfileGlobalSettings.uuid);
                        }

                        user.userProfiles = profiles.toString();
                    }
                    
                    insertUserHistory(settings.userUUID);
                    getProfileUsers(settings.defaultPro, settings.users);
                }
            })
        }
    }

    function handleMoveUserOutProfile() {

        if(settings.userUUID == '') {
            setModal({heading: 'Move User', message: 'You need to select an user first', open: true})
        } else {

            settings.users.map(user => {

                if(user.uuid == settings.userUUID) {

                    let profiles = [];

                    if(user.userProfiles != '') {
                        profiles = user.userProfiles.split(',');
                    }

                    const ID = profiles.indexOf(AdminProfileGlobalSettings.uuid.toString());

                    profiles.splice(ID, 1);

                    user.userProfiles = profiles.toString();
                    
                    insertUserHistory(settings.userUUID);
                    getProfileUsers(settings.defaultPro, settings.users);
                }
            })
        }
    }

    function insertUserHistory(uuid) {

        if(!userHistory.users.includes(uuid)) {

            setHistory(prevState => {
                return {users: [...userHistory.users, uuid]}
            });
        }
    }

    function showHelp() {

        const message = 'The priority system only affects the rooms in the profiles. If the same room in two different profiles is marked ‘view’, the priority profile settings are set for that room.'
        const message2 = 'The priority system does not affect any other settings in the profile. If a setting is turned on in any profile that is assigned to a particular user, the setting is on for that user.';

        setHelp({heading: 'Help: Priority System', message: message, message2: message2, open: true});
    }

    function changeTabs(section) {
        setTabs({ [section] : true });
    }

    function onChange() {
        //DO NOTHING
    }

    function settingOnClick(event) {

        const { name, checked } = event.target;

        updateSetting(UserProfileAdminGlobalSettings, dispatch, name, checked);
    }

    function changeAdminSetting(event) {

        const { name, checked } = event.target;

        updateAdminSetting(UserProfileAdminGlobalSettings, dispatch, name, checked);


    }


    return (<div>
        <Container fluid className='p-3'>
            <Jumbotron className='back-color'>
                
                <h1>Profile Settings</h1>
                <h2>{AdminProfileGlobalSettings.name}</h2>
                <br />
                <div className='align-right'>
                    {!settings.defaultPro ? (<div>
                            <Button variant='primary' onClick={handleUpdateProfile}>Update</Button>
                            <Image className='help-image' src={helpImg} onClick={showHelp} ></Image>
                        </div>) : null}
                        </div>
                <Row className='normal-text'>
                    <strong>Users:</strong>
                </Row>
                <br />
                    <Row>
                        <Col><strong>Users in this profile:</strong>
                            <div className='align-left, scrollable-300'>
                                <ListGroup>
                                    {settings.defaultPro ? (<div>
                                        {settings.profileUsers.map((user, index) => {
                                        return <ListGroup.Item href={'#' + index} key={index}>{user.displayName}</ListGroup.Item>
                                    })}
                                    </div>) : (<div>
                                        {settings.profileUsers.map((user, index) => {
                                        return <ListGroup.Item href={'#' + index} key={index} action onClick={() => handleUserClicked(user.uuid)}>{user.displayName}</ListGroup.Item>
                                    })}
                                    </div>) }
                                    
                                </ListGroup>
                            </div></Col>
                        <Col>
                            <div className='valign-center'>
                                <span className='valign'>
                                {!settings.defaultPro ? (<div>
                                    <Button onClick={handleMoveUserIntoProfile}>Move into profile</Button><br/>
                                    <Button onClick={handleMoveUserOutProfile}>Move out of profile</Button>
                                </div>) : null}
                                </span>
                                
                            </div>
                        </Col>
                        <Col>
                            {!settings.defaultPro ? (<div>
                                <strong>Users not in this profile:</strong>
                                <div className='align-left, scrollable-300'>
                                    <ListGroup>
                                        {settings.nonProfileUsers.map((user, index) => {
                                            return <ListGroup.Item key={index} action onClick={() => handleUserClicked(user.uuid)}>{user.displayName}</ListGroup.Item>
                                        })}
                                    </ListGroup>
                                </div>
                            </div>) : (<div>
                                <strong>
                                    This profile cannot be updated as it is the default profile which the system uses if a user is not assigned to a profile. <br /><br />
                                    This is the profile for User Level which is set up by High-View Studios. <br /> <br />
                                    An 'user' can see all the rooms and make bookings.<br /> <br />
                                    An 'admin' can make bookings on behalf of any user and any department. They are also able to make repeated bookings and able to delete any booking. <br /> <br />
                                    To have custom settings please make a profile and assign users to it.
                                </strong>
                            </div>)}
                        </Col>
                    </Row>
                    <Row>
                        <Col className='align-left'> 
                            <strong>Rooms:</strong>
                        </Col>
                        <Col className='align-left'>
                            {!settings.defaultPro ? (<strong>User Settings:</strong>) : null}
                        </Col>
                    </Row>
                    <Row>
                        <Col className='align-left profileSettings_warning'>
                            <strong>Rooms are affected by the priority system, see 'help' for more information.</strong>
                        </Col>
                        <Col>

                        </Col>
                    </Row>
                    <Row>
                        <Col className='align-right'>
                            <Button variant='primary' disabled>Selected</Button>
                            <Button variant='outline-primary' disabled>Unselected</Button>
                        </Col>
                        <Col className='align-left'>
                                {!settings.defaultPro ? (<div>
                                    <Button variant={tabs.bookings ? 'primary' : 'outline-primary'} onClick={() => {changeTabs('bookings')}}>Bookings</Button>
                                    <Button variant={tabs.admin ? 'primary' : 'outline-primary'} onClick={() => {changeTabs('admin')}}>Administrator</Button>   
                                </div>) : null}
                        </Col>
                    </Row>
                    <Row>
                        <Col className='align-left'>
                            <div className='scrollable-300'>
                                <ListGroup>
                                {settings.rooms.map((room, index) => {
                                                return <ListGroup.Item key={index}>
                                                    {settings.defaultPro ? (<div>
                                                        <Row>
                                                        <Col>{room.name}</Col>
                                                        <Col><Button variant={room.view ? 'primary' : 'outline-primary'} disabled>View</Button></Col>
                                                        <Col>{room.view ? <Button variant={room.write ? 'primary' : 'outline-primary'} disabled>Write</Button> : null}</Col>
                                                        <Col>{room.view ? <Button variant={room.edit ? 'primary' : 'outline-primary'} disabled>Edit</Button> : null}</Col>
                                                        <Col>{room.view ? <Button variant={room.delete ? 'primary' : 'outline-primary'} disabled>Delete</Button>: null}</Col>
                                                        <Col>{room.view ? <Button variant={room.repeat ? 'primary' : 'outline-primary'} disabled>Repeat</Button> : null}</Col>
                                                        </Row>
                                                    </div>) : (<div>
                                                        <Row>
                                                        <Col className='col-lg-2 button-width'>{room.name}</Col>
                                                        <Col className='col-lg-10'>
                                                            <Row>
                                                            <Col className='col-lg-2'></Col>
                                                            <Col className='col-lg-2'><Button id={index == 0 ? 'viewBtn' : null} className='button-width' variant={room.view ? 'primary' : 'outline-primary'} onClick={() => handleRoomSelectProperty(room.uuid, 'view')}>{settings.viewBtnSize <= 50 ? <i class="fas fa-eye"></i> : 'View'}</Button></Col>
                                                            <Col className='col-lg-2'><Button id={index == 0 ? 'writeBtn' : null} className={room.view ? 'button-width' : 'button-width btn-hidden'} variant={room.write ? 'primary' : 'outline-primary'} onClick={() => handleRoomSelectProperty(room.uuid, 'write')}>{settings.writeBtnSize <= 60 ? <i class="fas fa-pencil-alt"></i> : 'Write'}</Button></Col>
                                                            <Col className='col-lg-2'><Button id={index == 0 ? 'editBtn' : null} className={room.view ? 'button-width' : 'button-width btn-hidden'} variant={room.edit ? 'primary' : 'outline-primary'} onClick={() => handleRoomSelectProperty(room.uuid, 'edit')}>{settings.editBtnSize <= 50 ? <i class="fas fa-edit"></i> : 'Edit'}</Button></Col>
                                                            <Col className='col-lg-2'><Button id={index == 0 ? 'deleteBtn' : null} className={room.view ? 'button-width' : 'button-width btn-hidden'} variant={room.delete ? 'primary' : 'outline-primary'} onClick={() => handleRoomSelectProperty(room.uuid, 'delete')}>{settings.deleteBtnSize <= 70 ? <i class="fas fa-trash-alt"></i> : 'Delete'}</Button></Col>
                                                            <Col className='col-lg-2'><Button id={index == 0 ? 'repeatBtn' : null} className={room.view ? 'button-width' : 'button-width btn-hidden'} variant={room.repeat ? 'primary' : 'outline-primary'} onClick={() => handleRoomSelectProperty(room.uuid, 'repeat')}>{settings.repeatBtnSize <= 70 ? <i class="fas fa-redo-alt"></i> : 'Repeat'}</Button></Col>
                                                        
                                                            </Row>
                                                        </Col>
                                                        </Row>
                                                    </div>)}
                                                </ListGroup.Item>
                                })}
                                </ListGroup>
                            </div>
                        </Col>
                        <Col className='align-left'>
                        {!settings.defaultPro ? (<div>
                            <div className='userProfileTabs'>
                                {tabs.bookings ? (<div>
                                    <Form.Check type='checkbox' name='viewAllUsers' checked={UserProfileAdminGlobalSettings.settings.viewAllUsers} label='View All Users' onClick={settingOnClick} onChange={onChange} />
                                    <Form.Check type='checkbox' name='viewAllDepartments' checked={UserProfileAdminGlobalSettings.settings.viewAllDepartments} label='View All Departments' onClick={settingOnClick} onChange={onChange} />
                                </div>) : null}

                                {tabs.admin ? (<div>
                                    <Row>
                                        <Col>
                                            <Form.Check type='checkbox' checked={UserProfileAdminGlobalSettings.settings.orgAdminAccess} label='Organisation Admin Access' disabled onChange={onChange}/> <br />
                                            Select one section to activite the Organisation Admin Access
                                        </Col>
                                        <Col>
                                            <strong>Sections: </strong><br /><br />
                                            <Form.Check type='checkbox' name='admin_loginSettings' checked={UserProfileAdminGlobalSettings.settings.admin_loginSettings} label='Login Settings' onClick={changeAdminSetting} onChange={onChange} />
                                            <Form.Check type='checkbox' name='admin_departments' checked={UserProfileAdminGlobalSettings.settings.admin_departments} label='Departments' onClick={changeAdminSetting} onChange={onChange} />
                                            <Form.Check type='checkbox' name='admin_users' checked={UserProfileAdminGlobalSettings.settings.admin_users} label='Users' onClick={changeAdminSetting} onChange={onChange} />
                                            <Form.Check type='checkbox' name='admin_rooms' checked={UserProfileAdminGlobalSettings.settings.admin_rooms} label='Rooms' onClick={changeAdminSetting} onChange={onChange} />
                                            <Form.Check type='checkbox' name='admin_layouts' checked={UserProfileAdminGlobalSettings.settings.admin_layouts} label='Layouts' onClick={changeAdminSetting} onChange={onChange} />
                                            <Form.Check type='checkbox' name='admin_weekSystemHolidays' checked={UserProfileAdminGlobalSettings.settings.admin_weekSystemHolidays} label='Week System / Holidays' onClick={changeAdminSetting} onChange={onChange} />
                                            <Form.Check type='checkbox' name='admin_userProfiles' checked={UserProfileAdminGlobalSettings.settings.admin_userProfiles} label='User Profiles' onClick={changeAdminSetting} onChange={onChange} />
                                        </Col>
                                    </Row>
                                </div>) : null}
                            </div>
                        </div>) : null}
                        </Col>
                    </Row>
                    <Row>
                        <Col className='align-right'>
                            {!settings.defaultPro ? (<Button variant='primary' onClick={handleUpdateProfile}>Update</Button>) : null}
                        </Col>
                    </Row>
            </Jumbotron>
        </Container>
        <Modal show={modal.open} onHide={handleCloseModal}>
            <Modal.Header closeButton>
                <Modal.Title>{modal.heading}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {modal.message}
            </Modal.Body>
            <Modal.Footer>
                <Button variant='primary' onClick={handleCloseModal}>Close</Button>
            </Modal.Footer>
        </Modal>

        <Modal show={help.open} onHide={handleCloseHelp}>
            <Modal.Header closeButton>
                <Modal.Title>{help.heading}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {help.message}<br /> <br /> {help.message2}
            </Modal.Body>
            <Modal.Footer>
                <Button variant='primary' onClick={handleCloseHelp}>Close</Button>
            </Modal.Footer>
        </Modal>
    </div>)
}

export default ProfileSettings;