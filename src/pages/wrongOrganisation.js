import React, { useState, useEffect} from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import ServerPath, { hostPath } from "../ServerPath";
import { useSelector} from 'react-redux';

//Styles
import Button from "react-bootstrap/Button"
import Container from "react-bootstrap/Container";
import Jumbotron from "react-bootstrap/Jumbotron";

function WrongOrganisation(props) {

  const organisationID = props.match.params.id;

  const user = useSelector(state => state.user);
  const history = useHistory();

  useEffect(() => {
    document.title = "STAFF - Not Connected";
  },[])

  return (
    <div className="body">
    <Container className="p-3">
      <Jumbotron className="back-color">
        <h3>Sorry, this is not your organisation</h3><br /> <br />
        <Button variant="warning" onClick={() => history.push('/org/' + organisationID)}>Back to my organisation</Button><br /><br />
      </Jumbotron>
    </Container>
    </div>
  );
}

export default WrongOrganisation;
