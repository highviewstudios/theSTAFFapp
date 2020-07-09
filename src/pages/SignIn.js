import React, { useState, useEffect} from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import ServerPath, { hostPath } from "../ServerPath";
import { MDBIcon, MDBBtn } from 'mdbreact';

//Styles
import Button from "react-bootstrap/Button"
import Container from "react-bootstrap/Container";
import Jumbotron from "react-bootstrap/Jumbotron";

function SignIn() {

  const history = useHistory();
  const [message, setmessage] = useState('');

  useEffect(() => {
    document.title = "STAFF - Sign In";
    ServerPath();
  },[])

  return (
    <div className="body">
    <Container className="p-3">
      <Jumbotron className="back-color">
        <h3>Please Sign In!</h3>
        <form>
          <label id="lblEmail">Email:</label><br />
          <input id="txtEmail"type="email"></input><br /><br />
          <label id="lblPassword">Password:</label><br />
          <input id="txtPassword" type="password"></input>
          <p>{message}</p>
        </form><br />
        
        <Button variant="warning" onClick={logIn}>Log in</Button>
        <Button variant="warning" onClick={register}>Register</Button><br /><br />
        <MDBBtn color="red" social="gplus" href="http://localhost:8080/auth/google">
              <MDBIcon fab icon="google" className="pr-1" /> Log in with Google
        </MDBBtn>
      </Jumbotron>
    </Container>
    </div>
  );

  function logIn(event) {
    event.preventDefault();
    const email = document.getElementById("txtEmail").value;
    const password = document.getElementById("txtPassword").value;

    axios.get("/login?email=" + email + "&password=" + password)
    .then(res => {
        const message = res.data.message;
        if(message === "Logged in successful") {
            history.push('/');
        } else {
            setmessage(res.data.info);
        }
    })
    .catch(err => {
        console.log(err);
    });
  }

  function register() {
    history.push("/register");
  }
}

export default SignIn;
