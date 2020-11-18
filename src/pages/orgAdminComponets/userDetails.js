import React, { useContext, useEffect, useState } from 'react'
import { GUserContext } from '../../context/GUserContext';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {Container, Jumbotron, Col, Row, Form, Button, ListGroup, Modal} from 'react-bootstrap'
import Axios from 'axios';

function UserDetails(props) {

    const orgID = props.match.params.id;
    const organisation = useSelector(state => state.organisation);

    const { GUser } = useContext(GUserContext);
    const history = useHistory();

    const [user, setUser] = useState({
        name: '',
        email: '',
        roles: true,
        role_User: false,
        role_Admin: false,
        role_SeniorAdmin: false,
        departments: [],
        depToUser: ''
    });

    const [modalChangeSA, setModalChangeSA] = useState({
        open: false
    });

    function handleModalChangeSAClose() {
        setModalChangeSA(prevState => {
            return {...prevState,
            open: false
        }
    });
    }

    const [modal, setModal] = useState({
        open: false,
        heading: '',
        message: ''
    });

    function handleModalClose() {
        setModal(prevState => {
            return {...prevState,
            open: false
        }
    });
    }

    const [modalYN, setModalYN] = useState({
        open: false,
        heading: '',
        message: '',
        acceptFunction: '',
        acceptName: '',
        showAccept: false,
        cancelName: '',
        showCancel: false
    });

    const [modalTO, setModalTO] = useState({
        open: false,
        heading: '',
        message: '',
        option1Function: '',
        option1Name: '',
        showOption1: false,
        option2Function: '',
        option2Name: '',
        showOption2: false
    });

    function handleModalYNClose() {
        setModalYN(prevState => {
            return {...prevState,
            open: false
        }
    });
    }

    function handleModalTOClose() {
        setModalTO(prevState => {
            return {...prevState,
            open: false
        }
    });
    }

    useEffect(() => {
        onOpen();
    }, []);

    function handleRadioChange(event) {

        const { name } = event.target;

        if(name == 'role_User') {
            setUser(prevState => {
                return {...prevState,
                role_Admin: false,
                role_User: true}
            })
        }
        if(name == 'role_Admin') {
            setUser(prevState => {
                return {...prevState,
                role_Admin: true,
                role_User: false}
            })
        }
    }

    function onOpen() {

        const data = {uuid: GUser.uuid}
        Axios.post('/organisation/getJustUser', data)
        .then(res => {
            const data = res.data;
            console.log(data);
            if(data.error == 'no user') {
                history.push('/org/' + orgID + '/organisationAdmin');
            } else {
                setUser(prevState => {
                    return {...prevState, name: data.user.displayName, email: data.user.email, departments: ConvertIDsToDepartments(data.user.departments)};
                });
            }
            if(data.user.role == 'seniorAdmin') {
                setUser(prevState => {
                    return {...prevState, roles: false, role_SeniorAdmin: true, role_Admin: false, role_User: false};
                });
            } else if(data.user.role == 'admin') {
                setUser(prevState => {
                    return {...prevState, roles: true, role_SeniorAdmin: false, role_Admin: true, role_User: false};
                });
            } else if(data.user.role == 'user') {
                setUser(prevState => {
                    return {...prevState, roles: true, role_SeniorAdmin: false, role_Admin: false, role_User: true};
                });
            }
            
        })
        .catch(err => {
            console.log(err);
        })
    }

    function ConvertIDsToDepartments(IDs) {

        const userDepartments = IDs.split(',');

        let departmentArray = [];

        for(const department of userDepartments) {

            for( const dep of organisation.departments) {
                if(dep.uuid == department) {
                    departmentArray.push(dep.name);
                }
            }
        }

        return departmentArray;
    }

    function handleClickedItem_Deparment(name) {
        
        setUser(prevState => {
            return {...prevState, depToUser: name}
        });
    }

    function handleAddDepToUser() {

        if(!user.departments.includes(user.depToUser)) {
            setUser(prevState => {
                return {...prevState, departments: [...user.departments, user.depToUser]}
            });
        }
    }

    function hanldeRemoveDepFromUser() {

        if(user.departments.includes(user.depToUser)) {
            const newDep = user.departments.filter(name => {
                return name != user.depToUser;
            })

            setUser(prevState => {
                return {...prevState, departments: newDep}
            })
        }
    }

    function handleChange(event) {

        const { name, value } = event.target;

        setUser(prevState => {
            return {... prevState, [name]: value}
        })
    }

    function handleUpdate() {

        const departments = ConvertDepartmentsToIDs();
        
        let role = '';
        if(user.role_SeniorAdmin) role = 'seniorAdmin';
        if(user.role_User) role = 'user';
        if(user.role_Admin) role = 'admin';

        const data = {uuid: GUser.uuid, name: user.name, email: user.email, role: role, departments: departments, orgID: orgID};

        Axios.post('/organisation/updateUser', data)
        .then(res => {
            const data = res.data;

            if(data.message == 'User updated successfully') {
                setModal(prevState => {
                    return {...prevState, heading: 'Update User', message: 'User has been updated', open: true};
                });
            }
        })
        .catch(err => {
            console.log(err);
        })
    }

    function ConvertDepartmentsToIDs() {

        let departmentIndex = [];

        for(const department of organisation.departments) {

            if(user.departments.includes(department.name)) {
                departmentIndex.push(department.uuid);
            }
        }
        console.log(departmentIndex)

        return departmentIndex.toString();
    }

    function handleSeniorAdminRequest() {

        setModalChangeSA({open: true})
    }

    function handleAcceptOfSARequest() {

        const data = {orgID: orgID, newUUID: GUser.uuid};
        Axios.post('/organisation/changeSeniorAdmin', data)
        .then(res => {
            
            if(res.data.message == 'Request sent successfully') {

                setModalChangeSA({open: false});
                setModal({heading: 'Change of Senior Admin Request', message: 'A request has been sent to ' + user.name, open: true});
            }
        })
        .catch(err => {
            console.log(err);
        })
    }

    function handleUserChangeMethod() {

        const data = {uuid: GUser.uuid};
        Axios.post('/organisation/getUserLoginMethod', data)
        .then(res => {

            const method = res.data.method;

            if(method == '') {

                const message = res.data.name + " has not logged into the website yet, you can choose which method you want them to log in with.";

                setModalTO({heading: 'Change Login Method', message: message, option1Name: 'Local', option2Name: 'Google', option1Function: acceptToChangeToLocal, option2Function: acceptToChangeToGoogle,
                            showOption1: true, showOption2: true, open: true})

            } else {
            let newMethod;
            if(method == 'local') {
                newMethod = 'google'
            } else if(method == 'google') {
                newMethod = 'local'
            }

            const message = res.data.name + "'s login method is " + method + ". Are you sure you want to change it to a " + newMethod + " method?";

            setModalYN({heading: 'Change Login Method', message: message, acceptName: 'Yes', acceptFunction: () => {acceptToChangeMethods(GUser.uuid, newMethod, orgID)}, showAccept: true, cancelName: 'No', showCancel: true, open: true});    
            }
        })
        .catch(err => {
            console.log(err);
        })
    }

    function acceptToChangeMethods(id, newMethod, orgID) {

        setModalYN({open: false});
        
        const data = {orgID: orgID, uuid: id, method: newMethod}
        Axios.post('/organisaation/changeUserLoginMethod', data)
        .then(res => {
            if(res.data.message == 'Strategy Updated') {
                setModal({heading: 'Change Login Method', message: "This user's login method has now been changed", open: true})
            }
        })
        .catch(err => {
            console.log(err);
        })
    }

    function acceptToChangeToGoogle() {

        setModalTO({open: false});

        const data = {orgID: orgID, uuid: GUser.uuid, method: 'google'}
        Axios.post('/organisaation/changeUserLoginMethod', data)
        .then(res => {
            if(res.data.message == 'Strategy Updated') {
                setModal({heading: 'Change Login Method', message: "This user's login method has now been changed", open: true})
            }
        })
        .catch(err => {
            console.log(err);
        })
    }

    function acceptToChangeToLocal() {

        setModalTO({open: false});

        const data = {orgID: orgID, uuid: GUser.uuid, method: 'local'}
        Axios.post('/organisaation/changeUserLoginMethod', data)
        .then(res => {
            if(res.data.message == 'Strategy Updated') {
                setModal({heading: 'Change Login Method', message: "This user's login method has now been changed", open: true})
            }
        })
        .catch(err => {
            console.log(err);
        })
    }

    function handleRemove() {

        if(user.role_SeniorAdmin) {
            setModal({heading: 'Remove User', message: 'You cannot delete a Senior Admin', open: true});
        } else {

            setModalYN({heading: 'Remove User', message: 'Are you sure you want to remove this user and all their bookings?', acceptName: 'Yes', acceptFunction: acceptRemove, showAccept: true, showCancel: true, cancelName: 'No', open: true});
        }
    }

    function acceptRemove() {

        setModalYN({open: false});

        const data = {uuid: GUser.uuid, orgID: orgID};

            Axios.post('/organisation/removeUser', data)
            .then(res => {
                const data = res.data;

                if(data.message == 'User removed successfully') {
                    setModal(prevState => {
                        return {...prevState, heading: 'Remove User', message: 'User has been removed and deleted', open: true};
                    });

                    history.push('/org/'+orgID+'/organisationAdmin');
                }
            })
            .catch(err => {
                console.log(err);
            })
    }

    return (
        <div>
            <Container fluid className="p-3">
                <Jumbotron className="back-color">
                    <h1>User Details</h1>

                    <Row>
                        <Col>
                            <div className='normal-text'>
                                <Form>
                                    <Form.Row>
                                    <Form.Group as={Col}>
                                        <Form.Label id='lblName'><strong>Name:</strong></Form.Label>
                                        <Form.Control id='txtName' name='name' type='text' value={user.name} onChange={handleChange}/>
                                    </Form.Group>
                                    </Form.Row>
                                    <Form.Row>
                                    <Form.Group as={Col}>
                                        <Form.Label id='lblEmail'><strong>Email:</strong></Form.Label>
                                        <Form.Control id='txtEmail' name='email' type='text' value={user.email} onChange={handleChange}/>
                                    </Form.Group>
                                    </Form.Row>
                                    <Form.Row>
                                        <Form.Group as={Col}>
                                        <div className={user.roles ? null : 'roles-hidden'}>
                                            <Form.Label id="lblRole"><strong>Role:</strong></Form.Label>
                                            <Form.Check id="radRoleUser" type="radio" name='role_User' checked={user.role_User} onChange={handleRadioChange} label="User" /> 
                                            <Form.Check id="radRoleAdmin" type="radio" name='role_Admin' checked={user.role_Admin} onChange={handleRadioChange} label="Admin" />
                                        </div>
                                        </Form.Group>
                                    </Form.Row>
                                    <Form.Row>
                                        <Form.Group as={Col}>
                                            <Form.Label id="lblDepartmentsTitle"><strong>Departments:</strong></Form.Label> <br />
                                            {user.departments.length == 0 ? (
                                                <div className='departments-hidden'>
                                                    <Form.Label>---</Form.Label>
                                                </div>): (
                                                <div>
                                                    <Form.Label id="lblDepartments">{user.departments.toString()}</Form.Label>
                                                </div>)}
                                        </Form.Group>
                                        </Form.Row>
                                </Form>
                            </div>
                        </Col>
                        <Col>
                            <h3><strong>Departments</strong></h3>
                            <Row>
                                <Col>
                                    <Button onClick={handleAddDepToUser}>Add</Button><br />
                                    <Button onClick={hanldeRemoveDepFromUser}>Remove</Button>
                                </Col>
                                <Col>
                                    
                                    <div className='scrollable-250 normal-text'>
                                        <ListGroup>
                                            {organisation.departments.map((department, index) => {
                                                return <ListGroup.Item key={index} action onClick={() => { handleClickedItem_Deparment(department.name) }}>{department.name}</ListGroup.Item>
                                            })}
                                        </ListGroup>
                                    </div>
                                    <div className='add-button'>
                                        <Button onClick={handleUpdate}>Update User</Button>
                                    </div>
                                </Col>
                             </Row>
                        </Col>
                        <Col>
                            <div>
                                <h3><strong>Advanced Actions</strong></h3>
                                <Button onClick={handleSeniorAdminRequest}>S/A Request</Button> <br />
                                <Button onClick={handleUserChangeMethod}>Change Login Method</Button><br />
                                <Button onClick={handleRemove}>Remove</Button>
                            </div>
                        </Col>
                    </Row>
                </Jumbotron>
            </Container>

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
            <Modal show={modalChangeSA.open} onHide={handleModalChangeSAClose}>
            <Modal.Header closeButton>
            <Modal.Title>Change of Senior Admin Request</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>You are requesting {user.name} to change roles to the Senior Admin of this organisation. You can only have ONE Senior Admin per organisation, so this means you will not have access to the administrator panel for this organisation. Your role will change to Admin</p>
                <p>This user will also be to new ‘point of contact’ for High-View Studios.</p>
                <p>This user will be sent an email and they have to accept the request. In the meantime you will still have access.</p>
                <p>You and High-View Studios will be notified when this request has been accepted.</p>
                <p>Do you want to continue?</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={handleAcceptOfSARequest}>
                    Yes
                </Button>
                <Button variant="primary" onClick={handleModalChangeSAClose}>
                    No
                </Button>
            </Modal.Footer>
        </Modal>
        <Modal show={modalYN.open} onHide={handleModalYNClose}>
            <Modal.Header closeButton>
            <Modal.Title>{modalYN.heading}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{modalYN.message}</Modal.Body>
            <Modal.Footer>
            {modalYN.showAccept ? (<div>
                <Button variant="primary" onClick={modalYN.acceptFunction}>
                    {modalYN.acceptName}
                </Button>
            </div>) : null}
            {modalYN.showCancel ? (<div>
                <Button variant="primary" onClick={handleModalYNClose}>
                    {modalYN.cancelName}
                </Button>
            </div>) : null}
            </Modal.Footer>
        </Modal>
        <Modal show={modalTO.open} onHide={handleModalTOClose}>
            <Modal.Header closeButton>
            <Modal.Title>{modalTO.heading}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{modalTO.message}</Modal.Body>
            <Modal.Footer>
            {modalTO.showOption1 ? (<div>
                <Button variant="primary" onClick={modalTO.option1Function}>
                    {modalTO.option1Name}
                </Button>
            </div>) : null}
            {modalTO.showOption2 ? (<div>
                <Button variant="primary" onClick={modalTO.option2Function}>
                    {modalTO.option2Name}
                </Button>
            </div>) : null}
            </Modal.Footer>
        </Modal>
        </div>
    )
}

export default UserDetails