import React, { useEffect, useContext } from 'react';
import {useSelector} from 'react-redux';
import { useHistory } from 'react-router-dom';

//Styles
import Button from "react-bootstrap/Button"
import Container from "react-bootstrap/Container";
import Jumbotron from "react-bootstrap/Jumbotron";


function Home() {

  const user = useSelector(state => state.user);
  const history = useHistory();

  useEffect(() => {
    document.title = "STAFF";
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