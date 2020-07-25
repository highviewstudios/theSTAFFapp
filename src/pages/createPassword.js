import React, { useState, useEffect} from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { userUpdateNew } from '../store/actions/user';

//Styles
import Button from "react-bootstrap/Button"
import Container from "react-bootstrap/Container";
import Jumbotron from "react-bootstrap/Jumbotron";

function CreatePassword(props) {

  const organisationID = props.match.params.id;

  const history = useHistory();
  const [message, setmessage] = useState('');
  const dispatch = useDispatch();

  useEffect(() => {
    document.title = "STAFF";
  },[]);

  function setPassword(event) {
    event.preventDefault();

    const oldPassword = document.getElementById('txtCurrentPassword').value;
    const newPassword = document.getElementById('txtNewPassword').value;
    const confirmPassword = document.getElementById('txtConfirmPassword').value;

    if(oldPassword != '' && newPassword != '' && confirmPassword != '')
    {
      const url = '/createPassword/' + oldPassword + '/' + newPassword + '/' + confirmPassword;

      axios.get(url)
      .then(res => {
        if(res.data.userError == 'Yes') {
          setmessage(res.data.message);
        } else {
          if(res.data.message == 'Updated user first password') {
            dispatch(userUpdateNew(res.data.user.new));
            history.push("/org/" + organisationID);
          }
        }
      })
      .catch(err => {
        console.log(err);
      })
    }
}

  return (
    <div className="body">
    <Container className="p-3">
      <Jumbotron className="back-color">
        <h1>Hello, and welcome to My STAFF</h1>
        <h3>Please create a new password</h3>
        <form>
          <label id="lblCurrentPassword">Current Password:</label><br />
          <input id="txtCurrentPassword" type="password" required /><br /><br />
          <label id="lblNewPassword">New Password:</label><br />
          <input id="txtNewPassword" type="password" required /><br /> <br />
          <label id="lblConfirmPassword">Confirm Password:</label><br />
          <input id="txtConfirmPassword" type="password" required /><br /> <br />
          <p>{message}</p>
          <Button type='submit' variant="warning" onClick={setPassword}>Set Password</Button><br /><br />
        </form><br />
      </Jumbotron>
    </Container>
    </div>
  );
}

export default CreatePassword;
