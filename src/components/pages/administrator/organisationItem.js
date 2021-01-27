import React, {useState} from 'react';
import Card from "react-bootstrap/Card";
import { useDispatch } from 'react-redux'
import { Row, Col, Container, Dropdown, Modal, Button, Form} from 'react-bootstrap';
import Axios from 'axios';
import { UpdateOrganisationsSettings } from '../../../globalSettings/mainAdminSettings';

function OrganisationItem(props) {

    const dispatch = useDispatch();

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

    function handleModalYNClose() {
        setModalYN(prevState => {
            return {...prevState,
            open: false
        }
    });
    }

    function handleModalClose() {
        setModal(prevState => {
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

    const [roomModal, setRoomModal] = useState({
        open: false,
        orgName: '',
        orgID: '',
        allocatedRooms: 0,
        redeemedRooms: 0,
        newAllocation: 0,
        inputNumber: 0,
        updateBtn: false
    });

    function handleCloseRoomModal() {

        setRoomModal(prevState =>{
            return {...prevState, open: false}
        })
    }

    function ChangeLoginMethod(name, email, orgID) {

        const data = {email: email};

        Axios.post('/organisation/getSALoginMethod', data)
        .then(res => {
            const method = res.data.method;
            let newMethod;
            if(method == 'local') {
                newMethod = 'google'
            } else if(method == 'google') {
                newMethod = 'local'
            }
            const message = name + "'s login method is " + method + ". Are you sure you want to change it to a " + newMethod + " method?";

            setModalYN({heading: 'Change Login Method', message: message, acceptName: 'Yes', acceptFunction: () => {acceptToChangeMethods(email, newMethod, orgID)}, showAccept: true, cancelName: 'No', showCancel: true, open: true});    
        })
        .catch(err => {
            console.log(err);
        })
    }

    function rooms(orgName, orgID, allocatedRooms, redeemedRooms) {
        
        setRoomModal(prevState => {
            return {...prevState, open: true, orgName: orgName, orgID: orgID, allocatedRooms, redeemedRooms: redeemedRooms, inputNumber: '', newAllocation: ''}
        })
    }

    function roomsTextChanged(event) {

        const { value } = event.target;

        setRoomModal(prevState => {
            return {...prevState, inputNumber: value}
        });
    }

    function roomButtonsOnClick(sum) {

        if(roomModal.inputNumber == '') {
            setModal({heading: 'Rooms', message: 'Please enter the number of rooms', open: true});
        } else {
            if(sum == 'plus') {
                const total = roomModal.allocatedRooms + parseInt(roomModal.inputNumber);

                let updateShow = false;
                if(total != roomModal.allocatedRooms) {
                    updateShow = true;
                }

                setRoomModal(prevState => {
                    return {...prevState, newAllocation: total, inputNumber: '', updateBtn: updateShow}
                });

            } else if(sum == 'minus') {
                const total = roomModal.allocatedRooms - parseInt(roomModal.inputNumber);

                if(total < roomModal.redeemedRooms) {

                    setModal({heading: 'Rooms', message: 'You cannot decrease the allocation lower than the redeemed rooms', open: true});

                } else if(total < 1) {
                    
                    setModal({heading: 'Rooms', message: 'Invalid Data: You cannot have a minus number for the allocation of rooms', open: true});
                } else {

                    let updateShow = false;
                    if(total != roomModal.allocatedRooms) {
                        updateShow = true;
                    }

                    setRoomModal(prevState => {
                        return {...prevState, newAllocation: total, inputNumber: '', updateBtn: updateShow}
                    });

                }
            }
        }
    }

    function updateRooms() {

        const data = {orgID: roomModal.orgID, newAllocation: roomModal.newAllocation};
        Axios.post('/organisation/updateAlocatedRooms', data)
        .then(res => {
            if(res.data.message == 'Updated room allocation') {

                UpdateOrganisationsSettings(dispatch, res.data.organisations);
                setRoomModal(prevState => {
                    return {...prevState, open: false}
                });
                setModal({heading: 'Rooms', message: 'Updated room allocation!', open: true});
            }
        })
        .catch(err => {
            console.log(err);
        })
    }

    function isNumberInput(event) {

        var char = String.fromCharCode(event.which);

        if(!(/[0-9]/.test(char))) {
            event.preventDefault();
        }
    }

    function acceptToChangeMethods(email, method, orgID) {

        setModalYN({open: false});

        const data = {email: email, method: method, orgID: orgID};
        Axios.post('/organisation/changeASLoginMethod', data)
        .then(res => {
            if(res.data.message == 'Strategy Updated') {
                setModal({heading: 'Change Login Method', message: "This user's login method has now been changed", open: true})
            }
        })
        .catch(err => {
            console.log(err);
        })
    }

    return (
        <div>
            <Card body className='Organisations-ListBox'>
            <Row>
                <Col>
                    <label>{props.name}</label>
                </Col>
                <Col>
                    <label>{props.email}</label>
                </Col>
                <Col>
                    <label>{props.poc}</label>
                </Col>
                <Col>
                    <label>{props.orgID}</label>
                </Col>
                <Col>
                <Dropdown>
                        <Dropdown.Toggle variant='primary'>
                            More
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => {ChangeLoginMethod(props.poc, props.email, props.orgID)}}>Change Login Method</Dropdown.Item>
                            <Dropdown.Item onClick={() => {rooms(props.name, props.orgID, props.allocatedRooms, props.redeemedRooms)}}>Rooms</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </Col>
            </Row>
            </Card>
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
        <Modal show={roomModal.open} onHide={handleCloseRoomModal} centered>
            <Modal.Header closeButton>
                <Modal.Title>Rooms</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Container>
                    <Row>
                        Update the Allocated Rooms in {roomModal.orgName}
                    </Row>
                    <br />
                    <Row>
                        <Col>
                            Allocated Rooms: {roomModal.allocatedRooms} <br />
                            Redeemed Rooms: {roomModal.redeemedRooms}
                            <br /><br />
                            New Allocation: {roomModal.newAllocation}
                        </Col>
                        <Col>
                            <strong>Edit Rooms:</strong>
                            <Form.Control onKeyPress={isNumberInput} onChange={roomsTextChanged} value={roomModal.inputNumber} />
                            <Button onClick={() => {roomButtonsOnClick('plus')}}>+</Button>
                            <Button onClick={() => {roomButtonsOnClick('minus')}}>-</Button>
                        </Col>
                    </Row>
                </Container>
            </Modal.Body>
            <Modal.Footer>
            {roomModal.updateBtn ? (<Button variant='primary' onClick={updateRooms}>Update</Button>) : null}
                <Button variant='primary' onClick={handleCloseRoomModal}>Close</Button>
            </Modal.Footer>
        </Modal>
        </div>
    )
}

export default OrganisationItem;