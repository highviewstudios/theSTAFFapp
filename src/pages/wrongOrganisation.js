import React, { useState, useEffect} from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { UpdateForceSignIn, UpdateFromSignIn } from '../store/actions/globalVars';

//Styles
import Button from "react-bootstrap/Button"
import Container from "react-bootstrap/Container";
import Jumbotron from "react-bootstrap/Jumbotron";

function WrongOrganisation(props) {

  const organisationID = props.match.params.id;

  const globalVars = useSelector(state => state.globalVars);
  const user = useSelector(state => state.user);
  const history = useHistory();
  const dispatch = useDispatch();

  useEffect(() => {
    document.title = "STAFF - Not Connected";
  },[])

  function toOrgSignIn() {
    
    if(globalVars.forceSignIn) {
      dispatch(UpdateFromSignIn(true));
      dispatch(UpdateForceSignIn(false));
    } else {
      dispatch(UpdateFromSignIn(true));
      dispatch(UpdateForceSignIn(true));
    }
  }

  return (
    <div className="body">
    <Container className="p-3">
      <Jumbotron className="back-color">
        <h3>Sorry, this is not your organisation</h3><br /> <br />
        <Button variant="warning" onClick={toOrgSignIn}>Back to my organisation</Button><br /><br />
      </Jumbotron>
    </Container>
    </div>
  );
}

export default WrongOrganisation;
