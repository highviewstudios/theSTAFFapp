import React, { useState, useEffect} from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import ServerPath, { hostPath } from "../ServerPath";
import {useDispatch, useSelector} from 'react-redux';
import {userUpdateAuth, userUpdateName, userUpdateRole, userUpdateNew, userUpdateRequestedPassword, userUpdateOrgID} from '../store/actions/user';

//Styles
import Button from "react-bootstrap/Button"
import Container from "react-bootstrap/Container";
import Jumbotron from "react-bootstrap/Jumbotron";

function SignIn(props) {

  const organisationID = props.match.params.id;

  const user = useSelector(state => state.user);
  const organisation = useSelector(state => state.organisation);
  const history = useHistory();
  const dispatch = useDispatch();
  const [message, setmessage] = useState('');

  useEffect(() => {
    document.title = "STAFF - Sign In";
    ServerPath();
    //onOpen();
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
      <h1>{organisation.name}</h1> <br />
        <h3>Please Sign In!</h3>
        <p>{organisation.message}</p>
        {organisation.signInLocal ? (
          <div>
          <form>
          <label id="lblEmail">Email:</label><br />
          <input id="txtEmail"type="email"></input><br /><br />
          <label id="lblPassword">Password:</label><br />
          <input id="txtPassword" type="password"></input><br /> <br />
          <p>{message}</p>
        </form><br />
        
        <Button variant="warning" onClick={logIn}>Log in</Button>
        <Button variant="warning" onClick={() => history.push('/org/'+ organisationID +'/forgotPassword')}>Forgot Password</Button><br /><br />
          </div>) : (<div></div>)}

        {organisation.signInGoogle ? (
          <Button variant="danger" href={hostPath + "/auth/google"}><i className="fab fa-google"></i> Log in with Google</Button>
        ) : (<div></div>)}
        
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
      console.log(res.data);
        const message = res.data.message;
        if(message === "Logged in successful") {
            dispatch(userUpdateAuth(true));
            dispatch(userUpdateName(res.data.displayName));
            dispatch(userUpdateRole(res.data.role));
            dispatch(userUpdateNew(res.data.new));
            dispatch(userUpdateRequestedPassword(res.data.requestedPassword));
            dispatch(userUpdateOrgID(res.data.orgID));

            if(res.data.new == "true") {
              history.push('createPassword');
            } else {
            history.push('/org/' + organisationID);
            }
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
