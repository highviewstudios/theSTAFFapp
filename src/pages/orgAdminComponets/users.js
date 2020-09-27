import React, { useState } from 'react';
import { Collapse, Image, Row, Col, Form, Button, Modal, ListGroup } from 'react-bootstrap';

import plus from '../../public/images/plus.png';
import minus from '../../public/images/minus.png';
import { useSelector } from 'react-redux';
import Axios from 'axios';

function Users(props) {

    const orgID = props.orgID;
    const organisation = useSelector(state => state.organisation);

    const [settings, setSettings] = useState({
        open: false,
        name: '',
        email: '',
        role_User: false,
        role_Admin: false,
        role_SeniorAdmin: false,
        multiAdd: false,
        departments: [],
        depToUser: '',
        userDepartments: [],
        users: [],
        edit: false,
        editID: 0,
        roles: true
    });

    const [modal, setModal] = useState({
        open: false,
        heading: '',
        message: ''
    });

    const [modalChangeSA, setModalChangeSA] = useState({
        open: false
    });

    function handleModalClose() {
        setModal(prevState => {
            return {...prevState,
            open: false
        }
    });
    }

    function handleModalYNClose() {
        setModalChangeSA(prevState => {
            return {...prevState,
            open: false
        }
    });
    }

    function openTab() {

        if(!settings.open) {
            setSettings(prevState => {
                return {...prevState, departments: organisation.departments, open: true}
            })

            getAllOrgUsers();
        } else {
            setSettings(prevState => {
                return {...prevState, open: false}
            })
        }
    }

    function getAllOrgUsers() {

        const data = {orgID: orgID};

        Axios.post('/organisation/getUsers', data)
        .then(res => {
            console.log(res.data)
            setSettings(prevState => {
                return {...prevState, users: res.data.users}
            })
        })
        .catch(err => {
            console.log(err);
        })
    }

    function handleMultipleAdd() {
        setModal(prevState => {
            return {...prevState,
                heading: 'Multiple Add',
                message: 'The feature is not advailable yet',
                open: true
        }
    })
    }

    function handleSingleAdd() {

        if(settings.name == '' || settings.email == '') {
            setModal(prevState => {
                return {...prevState,
                    heading: 'Required',
                    message: 'Please fill in the name and email field.',
                    open: true
                }
            });
        } else if(!settings.role_User && !settings.role_Admin){
            setModal(prevState => {
                return {...prevState,
                    heading: 'Role',
                    message: 'Please pick a role.',
                    open: true
                }
            });
        } else {
            const departments = ConvertDepartmentsToIDs();
            
            let role = '';
            if(settings.role_User) role = 'user';
            if(settings.role_Admin) role = 'admin';

            const data = {orgID: orgID, name: settings.name, email: settings.email, role: role, departments: departments};

            Axios.post('/organisation/addUser', data)
            .then(res => {
                const data = res.data;

                if(data.userError == "Yes") {
                    setModal(prevState => {
                        return {...prevState,
                            heading: 'Add User',
                            message: data.message,
                            open: true
                        }
                    });
                } else {
                    setSettings(prevState => {
                        return {...prevState, 
                            users: res.data.users,
                            name: '',
                            email: '',
                            role_User: false,
                            role_Admin: false,
                            userDepartments: []
                            }
                    })
                }
            })
            .catch(err => {
                console.log(err);
            })
        }
    }

    function ConvertDepartmentsToIDs() {

        let departmentIndex = [];

        for(const department of organisation.departments) {

            if(settings.userDepartments.includes(department.name)) {
                departmentIndex.push(department.uuid);
            }
        }
        console.log(departmentIndex)

        return departmentIndex.toString();
    }

    function ConvertIDsToDepartments(IDs) {

        let departmentArray = [];

        for(const department of organisation.departments) {

            if(IDs.includes(department.uuid)) {
                departmentArray.push(department.name);
            }
        }

        return departmentArray;
    }

    function handleRadioChange(event) {

        const { name } = event.target;

        if(name == 'role_User') {
            setSettings(prevState => {
                return {...prevState,
                role_Admin: false,
                role_User: true}
            })
        }
        if(name == 'role_Admin') {
            setSettings(prevState => {
                return {...prevState,
                role_Admin: true,
                role_User: false}
            })
        }
    }

    function handleChange(event) {

        const { name, value } = event.target;

        setSettings(prevState => {
            return {... prevState, [name]: value}
        })
    }

    function handleClickedItem_Deparment(name) {
        
        setSettings(prevState => {
            return {...prevState, depToUser: name}
        });
    }

    function handleAddDepToUser() {

        if(!settings.userDepartments.includes(settings.depToUser)) {
            setSettings(prevState => {
                return {...prevState, userDepartments: [...settings.userDepartments, settings.depToUser]}
            });
        }
    }

    function hanldeRemoveDepFromUser() {

        if(settings.userDepartments.includes(settings.depToUser)) {
            const newDep = settings.userDepartments.filter(name => {
                return name != settings.depToUser;
            })

            setSettings(prevState => {
                return {...prevState, userDepartments: newDep}
            })
        }
    }

    function handleClickedItem_User(uuid, name, email, role, departments) {

        setSettings(prevState => {
            return {...prevState, name: name, email: email, userDepartments: ConvertIDsToDepartments(departments), edit: true, editID: uuid}
        });

        if(role == 'seniorAdmin') {
            setSettings(prevState => {
                return {...prevState, role_SeniorAdmin: true, role_Admin: false, role_User: false, roles: false,}
            })
        } else {
            if(role == 'user') {
                setSettings(prevState => {
                    return {...prevState, role_User: true, role_SeniorAdmin: false, role_Admin: false, roles: true}
                });
            } else if(role == 'admin') {
                setSettings(prevState => {
                    return {...prevState, role_Admin: true, role_SeniorAdmin: false, role_User: false, roles: true}
                });
            }
        }
    }

    function handleBackToAdd() {

        setSettings(prevState => {
            return {...prevState, edit: false, name: '', email: '', roles: true, role_Admin: false, role_User: false, userDepartments: ''}
        })    
    }

    function handleUpdate() {

        const departments = ConvertDepartmentsToIDs();
        
        let role = '';
        if(settings.role_SeniorAdmin) role = 'seniorAdmin';
        if(settings.role_User) role = 'user';
        if(settings.role_Admin) role = 'admin';

        const data = {uuid: settings.editID, name: settings.name, email: settings.email, role: role, departments: departments, orgID: orgID};

        Axios.post('/organisation/updateUser', data)
        .then(res => {
            const data = res.data;

            if(data.message == 'User updated successfully') {
                setModal(prevState => {
                    return {...prevState, heading: 'Update User', message: 'User has been updated', open: true};
                });

                setSettings(prevState => {
                    return {...prevState, users: data.users, edit: false};
                })
            }
        })
        .catch(err => {
            console.log(err);
        })
    }

    function handleRemove() {

        if(settings.role_SeniorAdmin) {
            setModal({heading: 'Remove User', message: 'You cannot delete a Senior Admin', open: true});
        } else {
            const data = {uuid: settings.editID, orgID: orgID};

            Axios.post('/organisation/removeUser', data)
            .then(res => {
                const data = res.data;

                if(data.message == 'User removed successfully') {
                    setModal(prevState => {
                        return {...prevState, heading: 'Remove User', message: 'User has been removed and deleted', open: true};
                    });

                    setSettings(prevState => {
                        return {...prevState, 
                            users: data.users,
                            name: '',
                            email: '',
                            role_Admin: false,
                            role_User: false,
                            userDepartments: [],
                            edit: false
                            };
                    });
                }
            })
            .catch(err => {
                console.log(err);
            })
        }
    }

    function handleSeniorAdminRequest() {

        setModalChangeSA({open: true})
    }

    function handleAcceptOfSARequest() {

        const data = {orgID: orgID, newUUID: settings.editID};
        Axios.post('/organisation/changeSeniorAdmin', data)
        .then(res => {
            
            if(res.data.message == 'Request sent successfully') {

                setModalChangeSA({open: false});
                setModal({heading: 'Change of Senior Admin Request', message: 'A request has been sent to ' + settings.name, open: true});
            }
        })
        .catch(err => {
            console.log(err);
        })
    }

    return (
        <div>
            <table width='100%' border='1px'>
                <thead>
                    <tr>
                        <th>
                            <div className="heading-text"> <Image className="plus-image" src={settings.open ? minus : plus} onClick={openTab} /> Users</div><br />
                            <Collapse in={settings.open}>
                            <div>
                                <div className='margin-text-hide'>
                                    -
                                </div>
                                <div className="normal-text">
                                    {/* <p>Name</p><p>Email</p><p>Role</p><p>Deparments</p> */}
                                    <Row>
                                        <Col>
                                            <Row>
                                            <Col className='bordered'>
                                                <strong>User Details:</strong>
                                                <Form>
                                                    <Form.Row>
                                                    <Form.Group as={Col}>
                                                        <Form.Label id="lblName">Name:</Form.Label>
                                                        <Form.Control id="txtName" name="name" type="text" value={settings.name} onChange={handleChange} />
                                                    </Form.Group>
                                                    </Form.Row>
                                                    <Form.Row>
                                                    <Form.Group as={Col}>
                                                        <Form.Label id="lblEmail">Email:</Form.Label>
                                                        <Form.Control id="txtEmail" name="email" value={settings.email} type="text" onChange={handleChange} />
                                                    </Form.Group>
                                                    </Form.Row>
                                                    <Form.Row>
                                                    <Form.Group as={Col}>
                                                    <div className={settings.roles ? null : 'roles-hidden'}>
                                                        <Form.Label id="lblRole">Role:</Form.Label>
                                                        <Form.Check id="radRoleUser" type="radio" name='role_User' checked={settings.role_User} onChange={handleRadioChange} label="User" /> 
                                                        <Form.Check id="radRoleAdmin" type="radio" name='role_Admin' checked={settings.role_Admin} onChange={handleRadioChange} label="Admin" />
                                                    </div>
                                                        
                                                    </Form.Group>
                                                    </Form.Row>
                                                    <Form.Row>
                                                    <Form.Group as={Col}>
                                                        <Form.Label id="lblDepartmentsTitle">Departments:</Form.Label> <br />
                                                        {settings.userDepartments.length == 0 ? (
                                                            <div className='departments-hidden'>
                                                                <Form.Label>---</Form.Label>
                                                            </div>): (
                                                            <div>
                                                                <Form.Label id="lblDepartments">{settings.userDepartments.toString()}</Form.Label>
                                                            </div>)}
                                                    </Form.Group>
                                                    </Form.Row>
                                                    <Form.Row>
                                                    <div className="submit-button-show">
                                                        {!settings.edit ? (<div>
                                                            <Button variant="primary" onClick={handleMultipleAdd}>Add Multiple</Button>
                                                            <Button variant="primary" onClick={handleSingleAdd}>Add</Button>
                                                        </div>) : (
                                                            <div>
                                                        <Button variant="primary" onClick={handleBackToAdd}>Add New User</Button>
                                                        <Button variant="primary" onClick={handleSeniorAdminRequest}>S/A Request</Button> </div>)}
                                                    </div>
                                                    </Form.Row>
                                                    
                                                    <Form.Row className={settings.edit ? 'user-edit' : 'user-edit edit-hidden'}>
                                                        <div> 
                                                            <Button variant="primary" onClick={handleRemove}>Remove</Button> 
                                                            <Button variant="primary" onClick={handleUpdate}>Update</Button> 
                                                        </div>
                                                    </Form.Row>
                                                </Form>
                                            </Col>
                                            <Col className='bordered'>
                                            <strong>Departments:</strong>
                                            <div className='scrollable-250'>
                                            <ListGroup>
                                                {settings.departments.map((department, index) => {
                                                   return <ListGroup.Item key={index} action onClick={() => { handleClickedItem_Deparment(department.name) }}>{department.name}</ListGroup.Item>
                                                })}
                                            </ListGroup>
                                            </div>
                                            <div className="add-button">
                                            <Button onClick={hanldeRemoveDepFromUser}>Remove</Button>
                                            <Button onClick={handleAddDepToUser}>Add</Button>
                                            </div>
                                            </Col>
                                            </Row>
                                        </Col>
                                        <Col>
                                            Users:
                                            <div className='scrollable-250'>
                                            <ListGroup>
                                                {settings.users.map((user, index) => {
                                                    let name = '';
                                                    if(user.role == 'seniorAdmin') {
                                                        name = user.displayName + " (Senior Admin)";
                                                    } else if (user.role == 'admin') {
                                                        name = user.displayName + " (Admin)";
                                                    } else {
                                                        name = user.displayName;
                                                    }
                                                    return <ListGroup.Item key={index} action onClick={() => { handleClickedItem_User(user.uuid, user.displayName, user.email, user.role, user.departments) }}>{name}</ListGroup.Item>
                                                })}
                                            </ListGroup>
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            </div>
                            </Collapse>
                        </th>
                    </tr>
                </thead>
            </table>

            <Modal show={modal.open} onHide={handleModalClose}>
                <Modal.Header closeButton>
                <Modal.Title>{modal.heading}</Modal.Title>
                </Modal.Header>
                <Modal.Body>{modal.message}</Modal.Body>
                <Modal.Footer>
                <Button variant="primary" onClick={handleModalClose}>
                    Close
                </Button>
                </Modal.Footer>
            </Modal>
            <Modal show={modalChangeSA.open} onHide={handleModalYNClose}>
            <Modal.Header closeButton>
            <Modal.Title>Change of Senior Admin Request</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>You are requesting {settings.name} to change roles to the Senior Admin of this organisation. You can only have ONE Senior Admin per organisation, so this means you will not have access to the administrator panel for this organisation. Your role will change to Admin</p>
                <p>This user will also be to new ‘point of contact’ for High-View Studios.</p>
                <p>This user will be sent an email and they have to accept the request. In the meantime you will still have access.</p>
                <p>You and High-View Studios will be notified when this request has been accepted.</p>
                <p>Do you want to continue?</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={handleAcceptOfSARequest}>
                    Yes
                </Button>
                <Button variant="primary" onClick={handleModalYNClose}>
                    No
                </Button>
            </Modal.Footer>
        </Modal>
        </div>
    )
}

export default Users;