import React, { useEffect} from 'react';
import { useHistory } from 'react-router-dom';

//Styles
import Button from "react-bootstrap/Button"
import Container from "react-bootstrap/Container";
import Jumbotron from "react-bootstrap/Jumbotron";

function WrongOrganisation(props) {

  const history = useHistory();

  useEffect(() => {
    document.title = "STAFF - Not Connected";
  },[])

  function toOrgSignIn() {
    console.log('click clock')
    history.replace('/');
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
