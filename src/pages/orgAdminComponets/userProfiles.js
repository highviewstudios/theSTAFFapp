import React, {useState, useContext} from 'react';
import { Button, Collapse, Form, Image, ListGroup, Modal } from 'react-bootstrap'
import { useHistory } from 'react-router-dom';

import { GProfileContext } from '../../context/GProfileContext';

import plus from '../../public/images/plus.png';
import minus from '../../public/images/minus.png';
import Axios from 'axios';

function UserProfiles(props) {

    const orgID = props.orgID;
    const history = useHistory();

    const { setIDAndName } = useContext(GProfileContext)

    const [settings, setSettings] = useState({
        open: false,
        profiles: [],
        useProfiles: false
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
            
            setSettings(prevState => {
                return {...prevState, profiles: data.profiles, useProfiles: (data.useProfiles == 'true'), open: true};
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

        setIDAndName(uuid, name);
        history.push('/org/' + orgID + '/profileSettings');
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
                                <Form.Check type='checkbox' checked={settings.useProfiles} label='Use User Profiles' onClick={handleUpdateUseProfiles} onChange={onChange} /><br />
                                <Button variant='primary' onClick={handleOpenCreateModal}>Create User Profile</Button>
                                <p>Double click on a profile to edit it's settings</p>
                                <ListGroup>
                                    {settings.profiles.map((profile, index) => {
                                        return <ListGroup.Item key={index} action onDoubleClick={() => goToSettings(profile.uuid, profile.name)}>{profile.name}</ListGroup.Item>
                                    })}
                                </ListGroup>
                                <br />
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
    </div>)
}

export default UserProfiles;