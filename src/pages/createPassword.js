import React, { useState, useEffect} from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { userUpdateNew } from '../store/actions/user';
import { UpdateForceSignIn, UpdateFromSignIn } from '../store/actions/globalVars';

//Styles
import Button from "react-bootstrap/Button"
import Container from "react-bootstrap/Container";
import Jumbotron from "react-bootstrap/Jumbotron";

function CreatePassword(props) {

  const [message, setmessage] = useState('');
  const [passwordHelp, setPasswordHelp] = useState(false);
  const dispatch = useDispatch();
  const globalVars = useSelector(state => state.globalVars);

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
      const data = { oldPassword: oldPassword, newPassword: newPassword, confirmPassword: confirmPassword};

      axios.post('/createPassword', data)
      .then(res => {
        if(res.data.userError == 'Yes') {
          if(res.data.message == 'Your password is not strong enough') {
            setmessage(res.data.message);
            setPasswordHelp(true);
          } else {
            setPasswordHelp(false);
            setmessage(res.data.message);
          }
        } else {
          if(res.data.message == 'Updated user first password') {
            dispatch(userUpdateNew(res.data.user.new));
            if(globalVars.forceSignIn) {
              dispatch(UpdateFromSignIn(true));
              dispatch(UpdateForceSignIn(false));
            } else {
              dispatch(UpdateFromSignIn(true));
              dispatch(UpdateForceSignIn(true));
            }
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
          {passwordHelp ? (
            <div className='password-help-text'>
              Your password must contain at least 1 uppercase, 1 lowercase, 1 number & 1 special character. It also requires to be a minimum 8 characters in length
          </div>) : null}
          <Button type='submit' variant="warning" onClick={setPassword}>Set Password</Button><br /><br />
        </form><br />
      </Jumbotron>
    </Container>
    </div>
  );
}

export default CreatePassword;
