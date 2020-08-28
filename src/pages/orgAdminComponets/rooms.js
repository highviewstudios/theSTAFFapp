import React, { useState } from 'react';
import { Image, Collapse, Row, Col, Form, Dropdown, Button, Modal, ListGroup } from "react-bootstrap";
import { useSelector, useDispatch } from 'react-redux'
import plus from '../../public/images/plus.png';
import minus from '../../public/images/minus.png';
import Axios from 'axios';
import { orgUpdateRedeemedRooms, orgUpdateRooms } from '../../store/actions/organistion';

function Rooms(props) {

    const orgID = props.orgID;
    const organisation = useSelector(state => state.organisation);
    const dispatch = useDispatch();

    const [settings, setSettings] = useState({
        open: false,
        layout: 'Layout',
        name: '',
        rooms: [],
        noAdd: false
    });

    const [modal, setModal] = useState({
        open: false,
        heading: '',
        message: '',
    });

    const [remove, setRemove] = useState({
        uuid: 0,
        activeRemove: false
    });

    function handleModalClose() {
        setModal(prevState => {
            return {...prevState,
            open: false
        }
    });
    }

    function openTab() {

        if(!settings.open) {
            setSettings(prevState => {
                return {...prevState, open: true}
            })
        } else {
            setSettings(prevState => {
                return {...prevState, open: false}
            })
        }

        const data = {orgID: orgID};

        Axios.post('/organisation/getRooms', data)
        .then(res => {
            const data = res.data;

            setSettings(prevState => {
                return{...prevState, rooms: data.rooms}
            });
        })
        .catch(err => {
            console.log(err);
        })

        checkIfAddRoomsAllowed(organisation.allocatedRooms, organisation.redeemedRooms);
    }

    function checkIfAddRoomsAllowed(allocatedRooms, redeemedRooms) {

        if(allocatedRooms === redeemedRooms) {
            setSettings(prevState => {
                return {...prevState, noAdd: true}
            });
        } else {
            setSettings(prevState => {
                return {...prevState, noAdd: false}
            });
        }
    }

    function handleChangeLayout(event) {

        const { innerText } = event.target;

        setSettings(preState => {
            return {...preState, layout: innerText};
        })
    }

    function handleTextChanged(event) {

        const { value } = event.target;

        setSettings(prevState => {
            return {...prevState, name: value}
        })
    }

    function handleRoomAdd() {

        if(settings.name === '') {
            setModal(prevState => {
                return {...prevState, heading: 'Add Room', message: 'The room requires a Name', open: true}
            });
        } else if (checkNameExsist(settings.name)) {
            setModal(prevState => {
                return {...prevState, heading: 'Add Room', message: 'A room with the same name already exists', open: true}
            });
        } else if (settings.layout === 'Layout') {
            setModal(prevState => {
                return {...prevState, heading: 'Add Room', message: 'The room requires a Layout', open: true}
            });
        } else {
            
            const data = {orgID: orgID, id: organisation.redeemedRooms, name: settings.name, layout: settings.layout.toLowerCase()};

            Axios.post('/organisation/addRoom', data)
            .then(res => {
                const data = res.data;

                if(data.message === 'Successfully added room') {
                    dispatch(orgUpdateRedeemedRooms(data.redeemedRooms));
                    dispatch(orgUpdateRooms(data.rooms));

                    setSettings(prevState => {
                        return {...prevState, rooms: data.rooms};
                    });

                    checkIfAddRoomsAllowed(organisation.allocatedRooms, data.redeemedRooms);
                }

            })
            .catch(err => {
                console.log(err);
            })
        }
    }

    function checkNameExsist(name) {

        let check = false;

        for(const room of settings.rooms) {
            if(room.name == name) {
                check = true;
                break;
            }
        }

        return check;
    }

    function handleItemOnClick(uuid) {

        setRemove(prevState => {
            return {...prevState, uuid: uuid, activeRemove: true}
        })
    }

    function handleRemoveRoom() {

        setModal(prevState => {
            return {...prevState, heading: 'Remove Room', message: "This feature hasn't been completed yet", open: true }
        })
    }


    return (
        <div>

            <table width='100%' border='1px'>
                <thead>
                    <tr>
                        <th>
                            <div className="heading-text"> <Image className="plus-image" src={settings.open ? minus : plus} onClick={openTab} /> Rooms</div><br />
                            <Collapse in={settings.open}>
                            <div>
                                <div className="normal-text">
                                    <Row>
                                        <Col>
                                        <Row>
                                            <Col>
                                                <Form>
                                                    {!settings.noAdd ? <div>
                                                        <Form.Group>
                                                        <Form.Label id='lblName'>Name:</Form.Label>
                                                        <Form.Control id='txtName' value={settings.name} onChange={handleTextChanged} />
                                                    </Form.Group>
                                                    <Form.Group>
                                                        <Form.Label className='side-by-side' id='lblName'>Layout:</Form.Label>
                                                        <Dropdown className='side-by-side'>
                                                            <Dropdown.Toggle variant='primary' id="dropdown-layouts">
                                                                {settings.layout}
                                                            </Dropdown.Toggle>
                                                            <Dropdown.Menu>
                                                                <Dropdown.Item onClick={handleChangeLayout}>Timetable</Dropdown.Item>
                                                                <Dropdown.Item onClick={handleChangeLayout}>Diary</Dropdown.Item>
                                                            </Dropdown.Menu>
                                                        </Dropdown>
                                                    </Form.Group>
                                                    </div> : null }
                                                    
                                                </Form>
                                            </Col>
                                            <Col>
                                                Allocated Rooms: {organisation.allocatedRooms} <br />
                                                Redeemed Rooms: {organisation.redeemedRooms}
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col>
                                            {!settings.noAdd ? <Button className='add-button' variant="primary" onClick={handleRoomAdd}>Add</Button> : null }
                                            </Col>
                                            <Col></Col>
                                        </Row>
                                        </Col>
                                        <Col>
                                            Room List:
                                            <div className="scrollable-300">
                                            <ListGroup>
                                                {settings.rooms.map((room, index) => {
                                                   return <ListGroup.Item key={index} action onClick={() => { handleItemOnClick(room.uuid) }}>{room.name} ({room.layout})</ListGroup.Item>
                                                })}
                                            </ListGroup>
                                            </div>
                                            <div className={remove.activeRemove ? "remove-button-show" : "remove-button-hidden"}>
                                                    <Button onClick={handleRemoveRoom}>Remove</Button>
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
        </div>
    )
}

export default Rooms;