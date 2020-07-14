import React, { useEffect} from 'react';

//Styles
import Container from "react-bootstrap/Container";
import Jumbotron from "react-bootstrap/Jumbotron";

function UserTest() {

  useEffect(() => {
    document.title = "TEST";
  },[]);

  return (
    <div className="body">
      <Container className="p-3">
            <Jumbotron className="back-color">
                <h1>TEST</h1>
            </Jumbotron>
        </Container>
    </div>
  );
}

export default UserTest;