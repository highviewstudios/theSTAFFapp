import React, { useState } from 'react';
import { Button, Collapse, Form, Image, ListGroup, Modal, Row, Col } from 'react-bootstrap'
import { useHistory } from 'react-router-dom';
import { setIDAndName } from '../../globalSettings/adminProfileSettings';
import { useDispatch } from 'react-redux';

import plus from '../../public/images/plus.png';
import minus from '../../public/images/minus.png';
import helpImg from '../../public/images/help.png';
import Axios from 'axios';

function UserProfiles(props) {

    const orgID = props.orgID;
    const history = useHistory();
    const dispatch = useDispatch();

    const [settings, setSettings] = useState({
        open: false,
        profiles: [],
        useProfiles: false,
        totalUsers: '',
        usersWithoutProfiles: '',
        defaultProfile: false,
        subMenu: false,
        profileUUID: ''
    });

    function openTab() {

        if(settings.open) {

            setSettings(prevState => {
                return {...prevState, open: false}
            });
        } else {

            getProfiles();
        }
    }

    function getProfiles() {

        const data = {orgID: orgID};
        Axios.post('/userProfile/getOrgProfiles', data)
        .then(res => {
            const data = res.data;
            
            let defaultPro = false;

            if(data.usersWithoutProfiles > 0) {
                defaultPro = true
            }
            
            setSettings(prevState => {
                return {...prevState, profiles: data.profiles, useProfiles: (data.useProfiles == 'true'), totalUsers: data.totalUsers, usersWithoutProfiles: data.usersWithoutProfiles, defaultProfile: defaultPro, open: true};
            });
        })
        .catch(err => {
            console.log(err);
        })
    }

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
        message3: ''
    });

    function handleCloseHelp() {
        setHelp(prevState => {
            return {...prevState, open: false}
        })
    }

    const [createModal, setCreateModal] = useState({
        open: false,
        newProfileName: ''
    });

    function handleOpenCreateModal() {
        setCreateModal(prevState => {
            return {...prevState, open: true}
        })
    }

    function handleCloseCreateModal() {

        setCreateModal(prevState => {
            return {...prevState, open: false}
        });
    }

    function handleCreateModalTextChange(event) {

        const { value } = event.target;

        setCreateModal(prevState => {
            return {...prevState, newProfileName: value}
        });
    }

    function handleCreate() {

        if(createModal.newProfileName == '') {
            setModal({heading: 'Create A Profile', message: 'Please enter a name', open: true});
        } else {

            const data = {orgID: orgID, name: createModal.newProfileName}
            Axios.post('/userProfile/createProfile', data)
            .then(res => {
                const data = res.data;

                if(data.message == 'Profile Created') {

                    setCreateModal(prevState => {
                        return {...prevState, open: false}
                    });

                    getProfiles();
                }
            })
            .catch(err => {
                console.log(err);
            })
        }
    }

    function goToSettings(uuid, name) {

        setIDAndName(dispatch, uuid, name);
        history.push('/org/' + orgID + '/profileSettings');
    }

    function openSubMenu(uuid) {

        setSettings(prevState => {
            return {...prevState, profileUUID: uuid, subMenu: true}
        });

    }

    function closeSubMenu() {

        setSettings(prevState => {
            return {...prevState, subMenu: false}
        });
    }

    function levelPriority(level) {

        const data = {orgID: orgID, level: level, profileUUID: settings.profileUUID}
        Axios.post('/userProfile/priority', data)
        .then(res => {

            setSettings(prevState => {
                return {...prevState, profiles: res.data.profiles}
            })
        })
        .catch(err => {
            console.log(err);
        })
    }

    function showHelp() {

        const message = 'The priority system only affects the rooms in the profiles. If the same room in two different profiles is marked ‘view’, the priority profile settings are set for that room.'
        const message2 = 'The priority system does not affect any other settings in the profile. If a setting is turned on in any profile that is assigned to a particular user, the setting is on for that user.';
        const message3 = "'1' is the highest profile in the priority system"

        setHelp({heading: 'Help: Priority System', message: message, message2: message2, message3: message3, open: true});
    }

    function handleUpdateUseProfiles(event) {

        const { checked } = event.target;
        
        setSettings(prevState => {
            return {...prevState, useProfiles: checked}
        });

        const data = {orgID: orgID, use: checked}
        Axios.post('/userProfile/useProfiles', data)
        .then(res => {
            console.log(res.data);
        })
        .catch(err => {
            console.log(err);
        })
    }

    function onChange() {
        //DO NOTHING
    }

    function removeProfile() {

        setModal({heading: 'Remove Profile', message: 'This feature has not be completed yet!', open: true});
    }

    return (<div>
        <table width='100%' border='1px'>
            <thead>
                <tr>
                    <th>
                        <div className='heading-text'><Image className='plus-image' src={settings.open ? minus : plus} onClick={openTab} /> User Profiles</div><br />
                        <Collapse in={settings.open}>
                        <div>
                            <div className='margin-text-hide'>
                                -
                            </div>
                            <div className='normal-text'>
                                <Row>
                                    <Col>
                                        <Form.Check type='checkbox' checked={settings.useProfiles} label='Use User Profiles' onClick={handleUpdateUseProfiles} onChange={onChange} /><br />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        {settings.useProfiles ? (<div>
                                            <div className='UP_priorities_Left'>
                                                <Button variant='primary' onClick={handleOpenCreateModal}>Create User Profile</Button>
                                                <p>Double click on a profile to edit it's settings</p>
                                            </div>
                                            <div className='UP_priorities_Right'>
                                                {settings.subMenu ? (<div>
                                                    <Button onClick={() => levelPriority('increase')}>Increase Priority</Button> <Button onClick={() => levelPriority('decrease')}>Decrease Priority</Button>  <Button hidden onClick={removeProfile}>Remove</Button>
                                                    <Image className='help-image' src={helpImg} onClick={showHelp}></Image>
                                                </div>) : null}
                                            </div>
                                        </div>) : null}
                                    </Col>
                                </Row>
                                <Row>
                                <Col>
                                {settings.useProfiles ? (<div>
                                    <ListGroup>
                                        {settings.defaultProfile ? <ListGroup.Item className='userProfiles_default_ListItem' action onClick={closeSubMenu} onDoubleClick={() => goToSettings('default', 'Default Profile (Access Level)')}>
                                            <Row>
                                                <Col>
                                                    Default Profile (Access Level)
                                                </Col>
                                                <Col>
                                                    {settings.usersWithoutProfiles} / {settings.totalUsers} users
                                                </Col>
                                                <Col>

                                                </Col>
                                            </Row>
                                        </ListGroup.Item> : null}
                                        {settings.profiles.map((profile, index) => {
                                            return <ListGroup.Item href={'#' + index} key={index} action onClick={() => openSubMenu(profile.uuid)} onDoubleClick={() => goToSettings(profile.uuid, profile.name)}>
                                            <Row>
                                                <Col>
                                                    {profile.name}
                                                </Col>
                                                <Col>
                                                    {profile.noOfUsers} / {settings.totalUsers} users
                                                </Col>
                                                <Col>
                                                    Priority: {profile.priority}
                                                </Col>
                                            </Row>
                                            </ListGroup.Item>
                                        })}
                                    </ListGroup>
                                    <br />
                                </div>) : null}
                                </Col>
                                </Row>
                            </div>
                        </div>
                        </Collapse>
                        
                    </th>
                </tr>
            </thead>
        </table>

        <Modal show={createModal.open} onHide={handleCloseCreateModal}>
            <Modal.Header closeButton>
                <Modal.Title>Create A Profile</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Please enter a name:
                <Form.Control type='text' value={createModal.newProfileName} onChange={handleCreateModalTextChange}></Form.Control>
            </Modal.Body>
            <Modal.Footer>
                <Button variant='primary' onClick={handleCreate}>Create</Button>
            </Modal.Footer>
        </Modal>

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
                {help.message}<br /> <br /> {help.message2} <br /> <br />{help.message3}
            </Modal.Body>
            <Modal.Footer>
                <Button variant='primary' onClick={handleCloseHelp}>Close</Button>
            </Modal.Footer>
        </Modal>
    </div>)
}

export default UserProfiles;