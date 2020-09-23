import React, {useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import { orgUpdateSignInLocal, orgUpdateSignInGoogle, orgUpdateMessage } from "../../store/actions/organistion";
import Shepherd from 'shepherd.js';
import "../../../node_modules/shepherd.js/dist/css/shepherd.css";

//Styles
import Button from "react-bootstrap/Button"
import Collapse from "react-bootstrap/Collapse";
import Form from "react-bootstrap/Form";
import { Row, Col } from 'react-bootstrap';
import Image from 'react-bootstrap/Image';
import plus from "../../public/images/plus.png";
import minus from "../../public/images/minus.png";
import Axios from 'axios';

function LoginSettings(props) {

    const orgID = props.orgID;

    const organisation = useSelector(state => state.organisation);
    const dispatch = useDispatch();

    const [loginSettings, setLoginSettings] = useState({
        open: false,
        auth_local: false,
        auth_google: false,
        message: '',
        save: false,
        showSave: false
      });

    //TOUR
    const tour = new Shepherd.Tour({
      defaultStepOtions: {
        classes: 'shepherd',
        scrollTo: true
      },
      useModalOverlay: true
    });

    tour.addStep({
      id: 'example-step',
      title: 'Message',
      text: 'This step is attached to the bottom of the <code>.example-css-selector</code> element.',
      attachTo: {
        element: '.example-class-selector',
        on: 'bottom'
      },
      classes: '',
      buttons: [
        {
          text: 'NEXT',
          action: tour.next
        }
      ]
    });

    function handleTourStart() {
        tour.start();
    }

    function openLogin() {

        if(!loginSettings.open) {
          setLoginSettings(prevState => {
            return {...prevState,
            auth_local: organisation.signInLocal,
            auth_google: organisation.signInGoogle,
            message: organisation.message,
            open: true }
          });
        } else {
          setLoginSettings(preState => {
            return {...preState, open: false}
          });
        }
      }
    
    function handleCheckChange(event) {

        const {name, checked} = event.target;
        setLoginSettings((prevState) => {
          return {...prevState, [name]: Boolean(checked),
          showSave: true}
        })
    
        console.log(name)
      }
    
      function handleTextChange(event) {
    
        const {name, value} = event.target;
        setLoginSettings((prevState) => {
          return {...prevState, [name]: value,
          showSave: true}
        })
      }
    
      function updateLoginSettings(event) {
        event.preventDefault();
    
        const auth_local = document.getElementById('LoginSettings_ckbLocal').checked;
        const auth_google = document.getElementById('LoginSettings_ckbGoogle').checked;
        const message = document.getElementById('LoginSettings_txtMessage').value;
    
        const data = {orgID: orgID, auth_local: auth_local.toString(), auth_google: auth_google.toString(), message: message};
    
        Axios.post('/organisation/updateLoginSettings', data)
        .then( res => {
          if(res.data.message == 'Login settings updated successfully') {
            dispatch(orgUpdateSignInLocal(auth_local));
            dispatch(orgUpdateSignInGoogle(auth_google));
            dispatch(orgUpdateMessage(message));
    
            setLoginSettings(preState => {
              return {...preState, save: true}
            });
    
            const timer = setTimeout(() => {
              setLoginSettings(preState => {
                return {...preState, save: false, showSave: false, open: false}
              });
      
            }, 2000)
          }
        })
        .catch (err => {
          console.log(err);
        })
    
      }
    
    return (
        <div>
            <table width='100%' border='1px'>
                <thead>
                  <tr>
                    <th>
                      <div className="heading-text"> <Image className="plus-image" src={loginSettings.open ? minus : plus} onClick={openLogin} /> Login Settings</div><br />
                      <Collapse in={loginSettings.open}> 
                      <div>
                        <div className='margin-text-hide'>
                          <Button variant='primary' onClick={handleTourStart}>Tour</Button>
                        </div>
                        <div className="normal-text">
                        <Row>
                        <Col>
                          <Form>
                            Login Options: 
                            <Form.Group as={Col}>
                            <Form.Check id="LoginSettings_ckbLocal" name="auth_local" type="checkbox" checked={loginSettings.auth_local} onChange={handleCheckChange} label="Local Login" />
                          </Form.Group>
                          <Form.Group as={Col}>
                            <Form.Check id="LoginSettings_ckbGoogle" name="auth_google" type="checkbox" checked={loginSettings.auth_google} onChange={handleCheckChange} label="Google Login" />
                          </Form.Group>
                          <Form.Label className='example-class-selector' id="LoginSettings_lblMessage">Login Message:</Form.Label><br />
                          <Form.Control id="LoginSettings_txtMessage" name="message" value={loginSettings.message} onChange={handleTextChange} type="text" required></Form.Control>
                          </Form>
                          </Col>
                          <Col></Col>
                          </Row>
                          </div>
                          <div className={loginSettings.showSave ? "submit-button-show" : "submit-button-hidden"}>
                         <Button variant='primary' type='submit' onClick={updateLoginSettings}>Save</Button> {loginSettings.save ? "Saved!" : null}
                          </div>
                        </div>
                      </Collapse>
                    </th>
                  </tr>
                </thead>
              </table>
        </div>
    )
}

export default LoginSettings;