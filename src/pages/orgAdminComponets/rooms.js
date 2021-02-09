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
        layoutUUID: 0,
        name: '',
        rooms: [],
        newAdd: false,
        layouts: false,
        editRoom: false,
        roomUUID: 0,
        yourLayouts: [],
        weekSystem: false,
        editAdd: false
    });

    const [modal, setModal] = useState({
        open: false,
        heading: '',
        message: '',
    });

    const [weekSystemModal, setWeekSystemModal] = useState({
        open: false,
        heading: '',
        message: '',
    });

    function handleModalClose() {
        setModal(prevState => {
            return {...prevState,
            open: false
        }
    });
    }

    function handleWeekSystemModalClose() {
        setWeekSystemModal(prevState => {
            return {...prevState,
            open: false
        }
    });
    }

    function handleWeekSystemModalYes() {

        setSettings(prevState => {
            return {...prevState, weekSystem: true}
        });

        setWeekSystemModal(prevState => {
            return {...prevState,
            open: false
        }
    });
    }

    function handleWeekSystemModalNo() {

        setSettings(prevState => {
            return {...prevState, weekSystem: false}
        });

        setWeekSystemModal(prevState => {
            return {...prevState,
            open: false
        }
    });
    }

    function openTab() {

        if(!settings.open) {

            const data = {orgID: orgID}
            Axios.post('/organisation/getLayouts', data)
            .then(res => {
                setSettings(prevState => {
                    return {...prevState, open: true, yourLayouts: res.data.layouts}
                });
            })
            .catch(err => {
                console.log(err);
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
            console.log(data);
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
        console.log(redeemedRooms);
        if(allocatedRooms === redeemedRooms) {
            setSettings(prevState => {
                return {...prevState, newAdd: false, layouts: false, editAdd: false}
            });
        } else {
            setSettings(prevState => {
                return {...prevState, newAdd: true, layouts: true, editAdd: true}
            });
        }
    }

    function handleChangeLayout(uuid, layout) {

        setSettings(prevState => {
            return {...prevState, layout: layout, layoutUUID: uuid};
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
            
            const data = {orgID: orgID, name: settings.name, layout: settings.layoutUUID, weekSystem: settings.weekSystem};

            Axios.post('/organisation/addRoom', data)
            .then(res => {
                const data = res.data;

                if(data.message === 'Successfully added room') {
                    dispatch(orgUpdateRedeemedRooms(data.redeemedRooms));
                    dispatch(orgUpdateRooms(data.rooms));

                    setSettings(prevState => {
                        return {...prevState, rooms: data.rooms, name: '', layout: 'layout', weekSystem: false};
                    });

                    checkIfAddRoomsAllowed(organisation.allocatedRooms, data.redeemedRooms);
                }

            })
            .catch(err => {
                console.log(err);
            })
        }
    }

    function handleRoomUpdate() {

        const data = {orgID: orgID, uuid: settings.roomUUID, layout: settings.layoutUUID};

        Axios.post('/organisation/updateRoom', data)
        .then(res => {

            if(res.data.message == 'Updated Room') {
                setSettings(prevState => {
                    return {...prevState, rooms: res.data.rooms, roomUUID: 0, editRoom: false, layouts: false};
                });

                checkIfAddRoomsAllowed(organisation.allocatedRooms, organisation.redeemedRooms);
            }
        })
        .catch(err => {
            console.log(err);
        })

    }

    function handleAddNewRoom() {

        setSettings(prevState => {
            return {...prevState, editRoom: false, layouts: false};
        });

        checkIfAddRoomsAllowed(organisation.allocatedRooms, organisation.redeemedRooms);
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

    function handleItemOnClick(uuid, layout, layoutUUID, weekSystem) {

        setSettings(prevState => {
            return{...prevState, roomUUID: uuid, editRoom: true, layouts: true, newAdd: false, layout: layout, layoutUUID: layoutUUID, weekSystem: (weekSystem == 'true')}
        })
    }

    function handleRemoveRoom() {

        setModal(prevState => {
            return {...prevState, heading: 'Remove Room', message: "This feature hasn't been completed yet", open: true }
        })
    }

    function getLayoutName(uuid) {

        for(const layout of settings.yourLayouts) {
            if(layout.uuid == uuid) {
                return layout.name;
            }
        }
    }

    function handleWeekSystemClicked(event) {
        
        const { checked } = event.target;
        
        if(checked) {

            const data = {orgID: orgID};

            Axios.post('/organisation/getMainOrgWeekSystem', data)
            .then(res => {
                console.log(res.data);
                if(res.data.weekSystem == 'false') {
                    setModal({heading: 'Week System', message: "You cannot turn on a room week system until you turn on the main week system in the 'Week System / Holidays' tab", open: true});

                    setSettings(prevState => {
                        return {...prevState, weekSystem: false}
                    });
                } else {
                    setSettings(prevState => {
                        return {...prevState, weekSystem: checked}
                    });
                }
            })
            .catch(err => {
                console.log(err);
            })
        } else {
            setSettings(prevState => {
                return {...prevState, weekSystem: checked}
            });
        }
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
                                <div className='margin-text-hide'>
                                -
                                </div>
                                <div className="normal-text">
                                    <Row>
                                        <Col>
                                                <Row>
                                                    <div className={settings.newAdd && settings.yourLayouts.length > 0 ? 'rooms-add' : 'rooms-add rooms-hide'}>
                                                        <Form>
                                                                <Form.Group>
                                                                <Form.Label id='lblName'>Name:</Form.Label>
                                                                <Form.Control id='txtName' value={settings.name} onChange={handleTextChanged} />
                                                            </Form.Group>
                                                        </Form>
                                                    </div>
                                                    <div className={settings.layouts && settings.yourLayouts.length > 0 ? '' : 'rooms-hide'}>
                                                        <Form>
                                                            <Form.Group>
                                                                <Form.Label className='side-by-side' id='lblName'>Layout:</Form.Label>
                                                                <Dropdown className='side-by-side'>
                                                                    <Dropdown.Toggle variant='primary' id="dropdown-layouts">
                                                                        {settings.layout}
                                                                    </Dropdown.Toggle>
                                                                    <Dropdown.Menu className='dropdown-items'>
                                                                        {settings.yourLayouts.map((layout, index) => {
                                                                            return <Dropdown.Item key={index} onClick={() => {handleChangeLayout(layout.uuid, layout.name)}}>{layout.name}</Dropdown.Item>
                                                                        })}
                                                                    </Dropdown.Menu>
                                                                </Dropdown>
                                                                {settings.newAdd ? (<div className='centred'>
                                                                    <Form.Check type='checkbox' checked={settings.weekSystem} onChange={handleWeekSystemClicked} label='Use week system' />
                                                                </div>) : null}
                                                                {settings.editRoom && settings.yourLayouts.length > 0 ? (<div className='centred'>
                                                                    Week System: {settings.weekSystem ? " Enabled" : " Disabled"}
                                                                </div>) : null}
                                                                
                                                            </Form.Group>
                                                        </Form>
                                                    </div>
                                                        
                                                </Row>
                                                <Row className='add-button'>
                                                    {settings.newAdd && settings.yourLayouts.length > 0 ? <Button variant="primary" onClick={handleRoomAdd}>Add</Button> : null }
                                                    {settings.editRoom && settings.yourLayouts.length > 0 ? (<div>
                                                        {settings.editAdd ? <Button variant="primary" onClick={handleAddNewRoom}>Add New Room</Button> : null }
                                                        <Button variant="primary" onClick={handleRoomUpdate}>Update</Button>
                                                    </div>) : null }
                                                </Row>
                                                <Row>
                                                    <div className={settings.yourLayouts.length == 0 ? 'rooms-layoutText' : 'rooms-layoutText rooms-hide'}>
                                                        <strong>
                                                        There are no layouts in your system yet, use the layouts tab to add one. Then your will be able to assign a room to a layout.
                                                        </strong>
                                                    </div>
                                                </Row>
                                            </Col>
                                        <Col>
                                            Allocated Rooms: {organisation.allocatedRooms} <br />
                                            Redeemed Rooms: {organisation.redeemedRooms}
                                        </Col>
                                        <Col>
                                            Room List:
                                            <div className="scrollable-300">
                                            <ListGroup>
                                                {settings.rooms.map((room, index) => {
                                                   return <ListGroup.Item href={'#' + index} variant={settings.roomUUID == room.uuid ? 'primary' : null} key={index} action onClick={() => { handleItemOnClick(room.uuid, getLayoutName(room.layout), room.layout, room.weekSystem) }}>{room.name} ({getLayoutName(room.layout)})</ListGroup.Item>
                                                })}
                                            </ListGroup>
                                            </div>
                                            <div className={settings.editRoom ? "remove-button-show" : "remove-button-hidden"}>
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
            <Modal show={weekSystemModal.open} onHide={handleWeekSystemModalClose}>
                <Modal.Header closeButton>
                <Modal.Title>Week System</Modal.Title>
                </Modal.Header>
                <Modal.Body>{modal.message}</Modal.Body>
                <Modal.Footer>
                <Button variant="primary" onClick={handleWeekSystemModalNo}>No</Button>
                <Button variant="primary" onClick={handleWeekSystemModalYes}>Yes</Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default Rooms;