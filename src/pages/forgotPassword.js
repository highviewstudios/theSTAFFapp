import React, { useState, useEffect} from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { userUpdateNew } from '../store/actions/user';

//Styles
import Button from "react-bootstrap/Button"
import Container from "react-bootstrap/Container";
import Jumbotron from "react-bootstrap/Jumbotron";
import { Form } from 'react-bootstrap';

function ForgotPassword(props) {

  const organisationID = props.match.params.id;

  const history = useHistory();
  const [message, setmessage] = useState('');
  const [sent, setSent] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    document.title = "STAFF";
  },[]);

  function requestPassword(event) {
    event.preventDefault();

    const email = document.getElementById('txtEmail').value;

    if(email != '')
    {
      const url = '/requestPassword/' + email 

      axios.get(url)
      .then(res => {
        if(res.data.userError == "Yes") {
          setmessage(res.data.message);
        } else {
          setSent(true);
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
        <h1>Forgot your password?</h1>
        {sent ? (
          <div>
          <h3>Your new password has been requested, please check your email</h3>
          <Button variant="warning" onClick={() => history.push('/org/' + organisationID + '/signIn')}>Back to Sign In</Button><br /><br />
          </div>
        ) : (
          <div>
            <h3>Please enter your email below:</h3><br/>
            <form>
              <Form.Control id="txtEmail" type="email" required /><br /> <br />
              <p>{message}</p>
              <Button type='submit' variant="warning" onClick={requestPassword}>Request New Password</Button><br /><br />
            </form><br />
          </div>
            )}
      </Jumbotron>
    </Container>
    </div>
  );
}

export default ForgotPassword;
