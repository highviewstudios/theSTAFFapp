import Axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { Button, Col, Container, Jumbotron, ListGroup, Row, Modal } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';

import { GProfileContext } from '../../context/GProfileContext';

function ProfileSettings(props) {

    const orgID = props.match.params.id;

    const { GProfile } = useContext(GProfileContext);
    const history = useHistory();

    useEffect(() => {

        if(GProfile.uuid == '') {
            history.push('/org/' + orgID + '/organisationAdmin');
        } else {
            loadProfile();
        }
    }, []);

    const [settings, setSettings] = useState({
        users: [],
        userUUID: '',
        nonProfileUsers: [],
        profileUsers: [],
        rooms: [],
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

    function loadProfile() {

        const data = {orgID: orgID, profileUUID: GProfile.uuid}
        Axios.post('/userProfile/loadProfile', data)
        .then(res => {
            const data = res.data;
            console.log(data);

            getProfileUsers(data.users);

            //ROOMS
            const UPRooms = data.UPRooms;
            const orgRooms = data.orgRooms;
            
            let rooms = [];

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
        })
        .catch(err => {
            console.log(err)
        })
    }

    function getProfileUsers(allUsers) {

        let nonProfileusers = [];
        let profileUsers = [];

        allUsers.map(user => {
            
            const profiles = user.userProfiles.split(',');

            if(profiles.includes(GProfile.uuid.toString())) {
                profileUsers.push(user);
            } else {
                nonProfileusers.push(user);
            }
        });

        setSettings(prevState => {
            return {...prevState, nonProfileUsers: nonProfileusers, profileUsers: profileUsers, users: allUsers, userUUID: ''}
        });
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
        })

        const data = {orgID: orgID, profileUUID: GProfile.uuid, usersToUpdate: usersToUpdate, rooms: settings.rooms};

        Axios.post('/userProfile/saveProfile', data)
        .then(res => {
            console.log(res.data);
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
                            profiles = [0];
                        } else {
                            profiles.push(GProfile.uuid);
                        }

                        user.userProfiles = profiles.toString();
                    }
                    
                    insertUserHistory(settings.userUUID);
                    getProfileUsers(settings.users);
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

                    const ID = profiles.indexOf(GProfile.uuid.toString());

                    profiles.splice(ID, 1);

                    user.userProfiles = profiles.toString();
                    
                    insertUserHistory(settings.userUUID);
                    getProfileUsers(settings.users);
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

    return (<div>
        <Container fluid className='p-3'>
            <Jumbotron className='back-color'>
                <h1>Profile Settings</h1>
                <h2>{GProfile.name}</h2>
                <br />
                <div className='align-right'>
                            <Button variant='primary' onClick={handleUpdateProfile}>Update</Button>
                        </div>
                <Row className='normal-text'>
                    <strong>Users:</strong>
                </Row>
                <br />
                    <Row>
                        <Col><strong>Users in this profile:</strong>
                            <div className='align-left, scrollable-300'>
                                <ListGroup>
                                    {settings.profileUsers.map((user, index) => {
                                        return <ListGroup.Item key={index} action onClick={() => handleUserClicked(user.uuid)}>{user.displayName}</ListGroup.Item>
                                    })}
                                </ListGroup>
                            </div></Col>
                        <Col>
                            <div className='valign-center'>
                                <span className='valign'>
                                    <Button onClick={handleMoveUserIntoProfile}>Move into profile</Button><br/>
                                    <Button onClick={handleMoveUserOutProfile}>Move out of profile</Button>
                                </span>
                                
                            </div>
                        </Col>
                        <Col>
                            <strong>Users not in this profile:</strong>
                            <div className='align-left, scrollable-300'>
                                <ListGroup>
                                    {settings.nonProfileUsers.map((user, index) => {
                                        return <ListGroup.Item key={index} action onClick={() => handleUserClicked(user.uuid)}>{user.displayName}</ListGroup.Item>
                                    })}
                                </ListGroup>
                            </div>
                        </Col>
                    </Row>
                
                <br />
                <Row>
                    <Col className='normal-text'>
                        <strong>Rooms:</strong><br />
                        <div className='align-right'>
                            <Button variant='primary' disabled>Selected</Button>
                            <Button variant='outline-primary' disabled>Unselected</Button>
                        </div>
                        <div>
                            {/* <a href='' onClick={handleSelectAllViews}>Select all Views</a> */}
                        </div>
                        <div className='scrollable-300'>
                            <ListGroup>
                            {settings.rooms.map((room, index) => {
                                            return <ListGroup.Item key={index}>
                                                <Row>
                                                <Col>{room.name}</Col>
                                                <Col><Button variant={room.view ? 'primary' : 'outline-primary'} onClick={() => handleRoomSelectProperty(room.uuid, 'view')}>View</Button></Col>
                                                <Col>{room.view ? <Button variant={room.write ? 'primary' : 'outline-primary'} onClick={() => handleRoomSelectProperty(room.uuid, 'write')}>Write</Button> : null}</Col>
                                                <Col>{room.view ? <Button variant={room.edit ? 'primary' : 'outline-primary'} onClick={() => handleRoomSelectProperty(room.uuid, 'edit')}>Edit</Button> : null}</Col>
                                                <Col>{room.view ? <Button variant={room.delete ? 'primary' : 'outline-primary'} onClick={() => handleRoomSelectProperty(room.uuid, 'delete')}>Delete</Button>: null}</Col>
                                                <Col>{room.view ? <Button variant={room.repeat ? 'primary' : 'outline-primary'} onClick={() => handleRoomSelectProperty(room.uuid, 'repeat')}>Repeat</Button> : null}</Col>
                                                </Row>
                                            </ListGroup.Item>
                            })}
                            </ListGroup>
                        </div>
                    </Col>
                    <Col>Other Settings</Col>
                </Row>
                <Row>
                    <Col>
                        <div className='align-right'>
                            <Button variant='primary' onClick={handleUpdateProfile}>Update</Button>
                        </div>
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
    </div>)
}

export default ProfileSettings;