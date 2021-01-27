import React, { useEffect, useState} from 'react';
import Axios from 'axios';
import { useHistory } from 'react-router-dom';

//Styles
import Button from "react-bootstrap/Button"
import Container from "react-bootstrap/Container";
import Jumbotron from "react-bootstrap/Jumbotron";
import Form from "react-bootstrap/Form"

//COMPONENTS
import OrganisationList from '../../components/pages/administrator/organisationList';
import { Col } from 'react-bootstrap';

function OrganisationRegister() {

  const [message, setMessage] = useState('');
  const history = useHistory();

  useEffect(() => {
    document.title = "STAFF - Administrator";
  },[]);

  function handleClick(event) {
    event.preventDefault();

    const orgName = document.getElementById("txtOrgName").value;
    const allocatRooms = document.getElementById("txtAlRooms").value;
    const authLocal = document.getElementById("ckbLocal").checked;
    const authGoogle = document.getElementById("ckbGoggle").checked;
    const pName = document.getElementById("txtName").value;
    const pEmail = document.getElementById("txtEmail").value;


    const data = {orgName: orgName, orgRooms: allocatRooms, authLocal: authLocal.toString(), authGoogle: authGoogle.toString(), pName: pName, pEmail: pEmail};
    Axios.post('/administrator/addOrganisation', data)
    .then(res => {
      const data = res.data;

      if(data.error != "null") {
        console.log(data.message);
      } else if(data.userError == "Yes") {
          setMessage(data.message);
      } else if (data.message == "Successfully added") {
        history.push("/administrator");
      }
    })
    .catch(err => {
      console.log(err);
    })

  }

  function isNumberInput(event) {

    var char = String.fromCharCode(event.which);

    if(!(/[0-9]/.test(char))) {
        event.preventDefault();
    }
  }

  return (
    <div className="body">
      <Container className="p-3">
            <Jumbotron className="back-color">
                <h1>Organisation Register</h1>

                <Form className="A-AddOrganisationText">
                <Form.Row>
                <Form.Group as={Col}>
                  <Form.Label id="lblOrgName">Organisation Name:</Form.Label><br />
                  <Form.Control id="txtOrgName" type="text" required></Form.Control>
                </Form.Group>
                <Form.Group as={Col}>
                  <Form.Label id="lblAlRooms">Allocated Rooms:</Form.Label><br />
                  <Form.Control id="txtAlRooms" type="text" onKeyPress={isNumberInput} required></Form.Control>
                </Form.Group>
                  </Form.Row>
                  <Form.Label id="lblAuthTypes">Types of Authencation:</Form.Label><br />
                  <Form.Row>
                <Form.Group as={Col}>
                  <Form.Check id="ckbLocal" type="checkbox" label="Local Login" />
                </Form.Group>
                <Form.Group as={Col}>
                  <Form.Check id="ckbGoggle" type="checkbox" label="Google Login" />
                </Form.Group>
                  </Form.Row>
                  <Form.Label className="A-AddOrganisationTextColor" id="lblPOC">Point of Contact (Senior Admin):</Form.Label><br />
                  <Form.Row>
                <Form.Group as={Col}>
                  <Form.Label id="lblName">Name:</Form.Label><br />
                  <Form.Control id="txtName" type="text" required />
                </Form.Group>
                <Form.Group as={Col}>
                  <Form.Label id="lblEmail">Email:</Form.Label><br />
                  <Form.Control id="txtEmail" type="text" required></Form.Control>
                </Form.Group>
                  </Form.Row>
                  <p>{message}</p>
                  <Button type="submit" onClick={handleClick} variant="warning">Register</Button>
                </Form>
            </Jumbotron>
        </Container>
    </div>
  );
}

export default OrganisationRegister;