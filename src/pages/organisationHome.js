import React, { useEffect, useContext, useState } from 'react';
import {useSelector, useDispatch} from 'react-redux';

import Timetable from '../components/pages/organisationHome/timetable';
import Diary from '../components/pages/organisationHome/diary';

//Styles
import Container from "react-bootstrap/Container";
import Jumbotron from "react-bootstrap/Jumbotron";
import { Row, Col, Dropdown, Button, Modal } from 'react-bootstrap';
import { UpdateBookingEdit } from '../store/actions/bookings';


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

  function handleModalClose() {
      setModal(prevState => {
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
    setModal({heading: 'Delete Booking', message: 'This feature has not been completed yet!', open: true})
  }

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
                <div className={bookings.editBooking ? 'edit-booking-show' : 'edit-booking-hide'}>
                          <div className='edit-delete'>
                            {user.role != 'user' ? <Button variant='primary' onClick={handleDeleteBooking}>Delete</Button> : null}
                          </div>
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
    </div>
  );
}

export default OrganisationHome;