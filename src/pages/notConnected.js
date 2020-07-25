import React, { useState, useEffect} from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import ServerPath, { hostPath } from "../ServerPath";
import { useSelector} from 'react-redux';

//Styles
import Button from "react-bootstrap/Button"
import Container from "react-bootstrap/Container";
import Jumbotron from "react-bootstrap/Jumbotron";

function NotConnected() {

  const user = useSelector(state => state.user);
  const history = useHistory();

  useEffect(() => {
    document.title = "STAFF - Not Connected";
    ServerPath();
    onOpen();
  },[])

  function onOpen() {
    if(user.auth) {
      history.push('/');
    }
  }

  return (
    <div className="body">
    <Container className="p-3">
      <Jumbotron className="back-color">
        <h3>Email is not connected to any organisation</h3>
        <Button variant="warning" onClick={() => history.push('/')}>Back to Home</Button><br /><br />
      </Jumbotron>
    </Container>
    </div>
  );
}

export default NotConnected;
