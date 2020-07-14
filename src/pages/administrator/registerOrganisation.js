import React, { useEffect} from 'react';

//Styles
import Container from "react-bootstrap/Container";
import Jumbotron from "react-bootstrap/Jumbotron";

//COMPONENTS
import OrganisationList from '../../components/pages/administrator/organisationList';

function OrganisationRegister() {

  useEffect(() => {
    document.title = "STAFF - Administrator";
  },[]);

  return (
    <div className="body">
      <Container className="p-3">
            <Jumbotron className="back-color">
                <h1>Organisation Register</h1>
            </Jumbotron>
        </Container>
    </div>
  );
}

export default OrganisationRegister;