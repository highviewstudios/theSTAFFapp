import React, { useEffect, useContext } from 'react';
import { UserContext } from '../context/userContext';

//Styles
import Button from "react-bootstrap/Button"
import Container from "react-bootstrap/Container";
import Jumbotron from "react-bootstrap/Jumbotron";

function Home() {

  const { updateUser } = useContext(UserContext)

  useEffect(() => {
    document.title = "STAFF";
  },[])

  return (
    <div className="body">
        <Container fluid className="p-3">
            <Jumbotron className="back-color">
              <h1>Home</h1>
            </Jumbotron>
        </Container>
    </div>
  );
}

export default Home;