import React, { useEffect } from 'react';
import {useSelector, useDispatch} from 'react-redux';
import { useHistory } from 'react-router-dom';
import { UpdateTab, UpdateFormSettings } from '../globalSettings/homePageSettings';
import useWindowSize from '../components/pages/windowSize';



//Styles
import { Container, Jumbotron, Row, Col, Navbar, Nav } from "react-bootstrap"

import OrgNumberSignIn from './homeComponents/orgNumberSignIn';

import HomePage from './homeComponents/homePage';
import Features from './homeComponents/features';
import Contact from './homeComponents/contact';


function Home() {

  const [windowHeight, windowWidth] = useWindowSize();
  const user = useSelector(state => state.user);
  const history = useHistory();
  const dispatch = useDispatch();
  const HomePageGlobalSettings = useSelector(state => state.HomePageGlobalSettings);
  

  useEffect(() => {
    document.title = "STAFF";
    console.log(HomePageGlobalSettings);
    onOpen();
  },[]);

  function onOpen() {
    console.log(user);
    if(user.auth == true) {
      if(user.role == "superAdmin") {
        history.push("/administrator");
      } else {
        history.push('/org/' + user.orgID);
      }
    }
  }

  function changeTab(tab) {

    UpdateTab(dispatch, tab);
    UpdateFormSettings(dispatch, false);
    
  }

  return (
    <div className="body">
        <Container fluid className="p-3">
            <Jumbotron fluid className="back-color home-jumbotron">
            <Row>
              <Col>
                <h1 className='blue-heading'><strong>A place to be flexible with your bookings...</strong></h1><br />
              </Col>
            </Row>
            <Row>
              <Col sm={10}>
              <Row>
                <Col>
                  <Navbar className='nav-bar' variant='dark'>
                    <Nav className='mx-auto'>
                      <Nav.Link className='nav-link' onClick={() => changeTab('home')}>Home &nbsp;</Nav.Link>
                      <Nav.Link className='nav-link' onClick={() => changeTab('features')}> &nbsp;Features &nbsp;</Nav.Link>
                      <Nav.Link className='nav-link' onClick={() => changeTab('contact')}> &nbsp;Contact</Nav.Link>
                    </Nav>
                  </Navbar>
                </Col>
              </Row>
              <br />
                {HomePageGlobalSettings.tab == 'home' ? (<HomePage />) : null}
                {HomePageGlobalSettings.tab == 'features' ? (<Features />) : null}
                {HomePageGlobalSettings.tab == 'contact' ? (<Contact />) : null}
              </Col>
              {windowWidth > 2000 ? (
                <Col>
                  <OrgNumberSignIn />
                </Col>
              ) : null}
            </Row>        
            </Jumbotron>
        </Container>
    </div>
  );
}

export default Home;