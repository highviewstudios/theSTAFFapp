import React, { useEffect, useContext, useState } from 'react';
import {useSelector, useDispatch} from 'react-redux';
import { orgUpdateName, orgUpdateSignInLocal, orgUpdateSignInGoogle, orgUpdateMessage, orgUpdateUseDepartments, orgUpdateNoOfDepartments, orgUpdateDepartments, orgUpdateAllocatedRooms, orgUpdateRedeemedRooms, orgUpdateRooms } from "../store/actions/organistion";
import { layoutsUpdateSessionTotal, layoutsUpdateBreakTotal, layoutsUpdateSessionOrder, layoutsUpdateTimetableDays, layoutsUpdateDiaryDays, layoutsUpdateStartTime, layoutsUpdateFinishTime, layoutsUpdateTimeInterval, layoutsUpdateSessions } from '../store/actions/layouts';
import { useHistory } from 'react-router-dom';
import Axios from 'axios';

import Timetable from '../components/pages/organisationHome/timetable';
import Diary from '../components/pages/organisationHome/diary';

//Styles
import Button from "react-bootstrap/Button"
import Container from "react-bootstrap/Container";
import Jumbotron from "react-bootstrap/Jumbotron";
import Layouts from './orgAdminComponets/layoutSettings';
import { Row, Col, Dropdown } from 'react-bootstrap';


function OrganisationHome(props) {
  
  const organisationId = props.match.params.id;

  const user = useSelector(state => state.user);
  const organisation = useSelector(state => state.organisation);
  const globalVars = useSelector(state => state.globalVars);

  const [settings, setSettings] = useState({
    orgTitle: '',
    roomName: 'Rooms',
    roomLayout: '',
    roomID: '',
    view: false
  });
  const history = useHistory();
  const dispatch = useDispatch();

  useEffect(() => {
    document.title = "STAFF";
    getOrgisation();
    CheckPreviousState();
  },[]);

  function CheckPreviousState() {
      if(globalVars.roomName != '') {
        console.log(globalVars.roomName);
        setSettings(prevState => {
          return {...prevState, roomName: globalVars.roomName, roomLayout: globalVars.roomLayout, roomID: globalVars.roomID};
        });

        setTimeout(() => {
          setSettings(prevState => {
            return {...prevState, view: true}
          })
        }, 100)
      }
  }

  function getOrgisation() {

    const url = '/organisation/' + organisationId;
    Axios.get(url)
    .then(res => {
      if(res.data.userError != "Yes") {
        dispatch(orgUpdateName(res.data.organisation.name));
        dispatch(orgUpdateSignInLocal((res.data.organisation.auth_Local == 'true')));
        dispatch(orgUpdateSignInGoogle((res.data.organisation.auth_Google == 'true')));
        dispatch(orgUpdateMessage(res.data.organisation.message));
        dispatch(orgUpdateUseDepartments((res.data.organisation.useDepartments == 'true')));
        dispatch(orgUpdateNoOfDepartments(res.data.organisation.noOfDepartments));
        dispatch(orgUpdateAllocatedRooms(res.data.organisation.allocatedRooms));
        dispatch(orgUpdateRedeemedRooms(res.data.organisation.redeemedRooms));
        dispatch(orgUpdateRooms(res.data.rooms));

        //LAYOUTS
        const layouts = res.data.layouts;

        for(const format of layouts.layouts) {
          
            if(format.layout == "Timetable") {
                dispatch(layoutsUpdateSessionTotal(format.sessions));
                dispatch(layoutsUpdateBreakTotal(format.breaks));
                dispatch(layoutsUpdateSessionOrder(format.sessionOrder.split(',')));

                let days = format.days.split(',');
                days.forEach((day, index) => {
                  days[index] = (day == 'true');
                }); 
                
                dispatch(layoutsUpdateTimetableDays(days));

                let sessions = {};
                for(const session of layouts.sessions) {
                  sessions[session.id] = session;
                }

                dispatch(layoutsUpdateSessions(sessions));

            } else if(format.layout == "Diary") {

                let days = format.days.split(',');
                days.forEach((day, index) => {
                  days[index] = (day == 'true');
                }); 

                dispatch(layoutsUpdateDiaryDays(days));
                dispatch(layoutsUpdateStartTime(format.startTime));
                dispatch(layoutsUpdateFinishTime(format.finishTime));
                dispatch(layoutsUpdateTimeInterval(format.timeInterval));
            }
        }
        
        if(user.auth == false) {
          history.push('/org/' + organisationId + '/signIn');
        } else {
          if(user.orgID != organisationId) {
            history.push('/org/'+ user.orgID +'/wrongOrganisation');
          } else if (user.requestedPassword == 'true') {
            history.push('/org/'+ organisationId +'/changePassword');
          } else if(user.new == 'true') {
            history.push('/org/' + organisationId +'/createPassword');
          } else {
            setSettings(prevState => {
              return {...prevState, orgTitle: res.data.organisation.name};
            });
          }
        }
      } else {
        history.push('/');
      }
    })
    .catch(err => {
      console.log(err);
    })

    const data = {orgID: organisationId}
    Axios.post('/organisation/allDepartments', data)
    .then(res => {
        dispatch(orgUpdateDepartments(res.data.departments));
    })
    .catch(err => {
      console.log(err);
    })
  }

  function handleRoomDropdownClick(name, layout, id) {

    setSettings(prevState => {
      return {...prevState, roomName: name, roomLayout: '---', roomID: id}
    });

      setSettings(prevState => {
        return {...prevState, roomName: name, roomLayout: layout, roomID: id, view: false}
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
              <h1>{settings.orgTitle}</h1>

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
                            return <Dropdown.Item key={index} onClick={() => { handleRoomDropdownClick(room.name, room.layout, room.id)}}>{room.name}</Dropdown.Item>
                          })}
                        </Dropdown.Menu>
                    </Dropdown>
                </Col>
                <Col></Col>                
              </Row>
              <Row>
                <Col>text</Col>
                <Col xs={8}>
                {settings.view ? (<div>
                  {settings.roomLayout != '' && settings.roomLayout == 'timetable' ? <Timetable orgID={organisationId} roomName={settings.roomName} roomID={settings.roomID}/> : null}
                  {settings.roomLayout != '' && settings.roomLayout == 'diary' ? <Diary orgID={organisationId} roomName={settings.roomName} roomID={settings.roomID}/> : null}
                </div>) : null}
                </Col>
                <Col>Text</Col>                
              </Row>
            </Jumbotron>
        </Container>
    </div>
  );
}

export default OrganisationHome;