import React, { useEffect} from 'react';
import ServerPath, { hostPath } from "../../ServerPath";

//Styles
import Button  from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Jumbotron from "react-bootstrap/Jumbotron";
import Form from "react-bootstrap/Form";

function Home() {

  useEffect(() => {
    document.title = "STAFF - Administrator";
  },[]);

  return (
    <div className="body">
      <Container fluid className="p-3">
            <Jumbotron className="back-color">
              <h1>Administrator Home</h1>
            </Jumbotron>
        </Container>
    </div>
  );
}

export default Home;