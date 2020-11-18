import React, { useEffect, useContext, useState } from 'react';
import {useSelector, useDispatch} from 'react-redux';

import Timetable from '../components/pages/organisationHome/timetable';
import Diary from '../components/pages/organisationHome/diary';

//Styles
import Container from "react-bootstrap/Container";
import Jumbotron from "react-bootstrap/Jumbotron";
import { Row, Col, Dropdown, Button, Modal } from 'react-bootstrap';
import { UpdateBookingEdit } from '../store/actions/bookings';
import Axios from 'axios';


function OrganisationHome(props) {
  
  const organisationId = props.match.params.id;

  const organisation = useSelector(state => state.organisation);
  const globalVars = useSelector(state => state.globalVars);
  const bookings = useSelector(state => state.bookings);
  const user = useSelector(state => state.user);
  const dispatch = useDispatch();

  const [settings, setSettings] = useState({
    orgTitle: '',
    orgLocked: '',
    roomName: 'Rooms',
    roomLayout: '',
    roomID: '',
    layoutData: {},
    view: false,
    weekSystem: false
  });

  const [modal, setModal] = useState({
      open: false,
      heading: '',
      message: '',
  });

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

  function handleModalClose() {
      setModal(prevState => {
          return {...prevState,
          open: false
      }
  });
  }

  function handleModalYNClose() {
      setModalYN(prevState => {
          return {...prevState,
          open: false
      }
  });
  }

  useEffect(() => {
    document.title = "STAFF";
    CheckPreviousState();
  },[]);

  function CheckPreviousState() {
      if(globalVars.roomName != '') {
        console.log(globalVars.roomName);
        setSettings(prevState => {
          return {...prevState, roomName: globalVars.roomName, roomLayout: globalVars.layoutData.layout, layoutData: globalVars.layoutData, roomID: globalVars.roomID, weekSystem: globalVars.weekSystem};
        });

        setTimeout(() => {
          setSettings(prevState => {
            return {...prevState, view: true}
          })
        }, 100)
      }
  }



  function handleRoomDropdownClick(name, layoutUUID, id, weekSystem) {

    setSettings(prevState => {
      return {...prevState, roomName: name, roomLayout: '---', roomID: id, weekSystem: false}
    });

    let layoutData;
    for(const layout of organisation.layouts) {
      if(layout.uuid == layoutUUID) {
        layoutData = layout;
      } 
    }

    setSettings(prevState => {
      return {...prevState, roomName: name, roomLayout: layoutData.layout, roomID: id, weekSystem: (weekSystem == 'true'), layoutData: layoutData, view: false}
    });
    dispatch(UpdateBookingEdit(false))
    setTimeout(() => {
      setSettings(prevState => {
        return {...prevState, view: true}
      })
    }, 100);
  }

  //EDIT BOOKING
  function handleDeleteBooking() {
    setModalYN({heading: 'Delete Booking', message: 'Are you sure you want to delete this booking?', acceptFunction: acceptDelete, acceptName: 'Yes', showAccept: true, showCancel: true, cancelName: 'No', open: true});
  }

  function acceptDelete() {

    setModalYN({open: false});

    const data = {orgID: organisationId, bookingID: bookings.bookingID};
    Axios.post('/booking/deleteBooking', data)
    .then(res => {
      const data = res.data;
      if(data.error == 'null') {
        setModal({heading: 'Delete booking', message: 'Booking deleted!', open: true});
        
        dispatch(UpdateBookingEdit(false));

        setSettings(prevState => {
          return {...prevState, view: false}
        })

        setTimeout(() => {
          setSettings(prevState => {
            return {...prevState, view: true}
          })
        }, 100);
      }
    })
    .catch(err => {
      console.log(err);
    })
  }
  ////////////////////////////////////////////////////////

  return (
    <div className="body">
        <Container fluid className="p-3">
            <Jumbotron className="back-color">
                <h1>{organisation.name}</h1>
                {organisation.locked ? <h2>Organisation Locked</h2> : null}
              <Row>
                <Col></Col>
                <Col xs={8}>
                <div className='roomLbl'>
                Rooms:
                </div>
                <Dropdown className='rooms'>
                        <Dropdown.Toggle variant='primary' id="dropdown-layouts">
                            {settings.roomName}
                        </Dropdown.Toggle>
                        <Dropdown.Menu className='dropdown-items'>
                          {organisation.rooms.map((room, index) => {
                            return <Dropdown.Item key={index} onClick={() => { handleRoomDropdownClick(room.name, room.layout, room.uuid, room.weekSystem)}}>{room.name}</Dropdown.Item>
                          })}
                        </Dropdown.Menu>
                    </Dropdown>
                </Col>
                <Col></Col>                
              </Row>
              <Row>
                <Col></Col>
                <Col xs={8}>
                {settings.view ? (<div>
                  {settings.roomLayout != '' && settings.roomLayout == 'Timetable' ? <Timetable orgID={organisationId} roomName={settings.roomName} roomID={settings.roomID} layoutData={settings.layoutData} weekSystem={settings.weekSystem}/> : null}
                  {settings.roomLayout != '' && settings.roomLayout == 'Diary' ? <Diary orgID={organisationId} roomName={settings.roomName} roomID={settings.roomID} layoutData={settings.layoutData} weekSystem={settings.weekSystem}/> : null}
                </div>) : null}
                </Col>
                <Col>
                <Row>
                  <div className='row-nothing'>
                    <Button disabled>Test</Button>
                  </div>
                </Row>
                <Row>
                  <Col>
                    <div className={bookings.editBooking ? 'edit-booking-show' : 'edit-booking-hide'}>
                      <strong>Booking Details</strong>
                      <div className='align-left'>
                            <br />
                            <Row>
                              <Col>
                                <strong>User:</strong>
                              </Col>
                              <Col>
                                {bookings.user}
                              </Col>
                            </Row>
                            <Row>
                              <Col>
                                <strong>Department:</strong>
                              </Col>
                              <Col>
                                {bookings.department}
                              </Col>
                            </Row>
                            <Row>
                              <Col>
                                <strong>Class:</strong>
                              </Col>
                              <Col>
                                {bookings.sessionDes}
                              </Col>
                            </Row>
                            <Row>
                              <Col>
                                <br /><strong>Session Length:</strong>
                              </Col>
                              <Col>
                                <br />{bookings.sessionLength}
                              </Col>
                            </Row>
                            <Row>
                              <Col>
                                <strong>Booking Type:</strong>
                              </Col>
                              <Col>
                                {bookings.bookingType}
                              </Col>
                            </Row>
                            {bookings.bookingType == 'Repeat - weekly' || bookings.bookingType == 'Repeat - Daily' ? (
                              <div>
                                <Row>
                                  <Col>
                                    <strong>Repeat Until:</strong>
                                  </Col>
                                  <Col>
                                    {bookings.bookingUntil}
                                  </Col>
                                </Row>
                              </div>
                            ) : null}
                            {bookings.comments != '' ? (<div>
                              <Row>
                              <Col>
                                <br /><strong>Comments</strong>
                              </Col>
                            </Row>
                            <Row>
                              <Col>
                                {bookings.comments}
                              </Col>
                            </Row>
                            </div>) : null}
                            
                              <br /> <br />{user.role != 'user' ? <Button variant='primary' onClick={handleDeleteBooking}>Delete</Button> : null}
                      </div>
                    </div>
                    </Col>
                  </Row>
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
    </div>
  );
}

export default OrganisationHome;