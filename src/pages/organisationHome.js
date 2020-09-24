import React, { useEffect, useContext, useState } from 'react';
import {useSelector, useDispatch} from 'react-redux';
import { useHistory, BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import Timetable from '../components/pages/organisationHome/timetable';
import Diary from '../components/pages/organisationHome/diary';

//Styles
import Container from "react-bootstrap/Container";
import Jumbotron from "react-bootstrap/Jumbotron";
import { Row, Col, Dropdown } from 'react-bootstrap';


function OrganisationHome(props) {
  
  const organisationId = props.match.params.id;

  const organisation = useSelector(state => state.organisation);
  const globalVars = useSelector(state => state.globalVars);

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

    setTimeout(() => {
      setSettings(prevState => {
        return {...prevState, view: true}
      })
    }, 100);
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
                <Col></Col>                
              </Row>
            </Jumbotron>
        </Container>
    </div>
  );
}

export default OrganisationHome;