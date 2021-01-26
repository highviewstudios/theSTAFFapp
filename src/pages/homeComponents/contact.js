import React from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import Axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { UpdateFormSettings } from '../../globalSettings/homePageSettings'

function Contact() {

    const HomePageGlobalSettings = useSelector(state => state.HomePageGlobalSettings);
    const dispatch = useDispatch();

    function onSubmit(event) {
        event.preventDefault();

        const name = document.getElementById('contactForm-Name').value;
        const email = document.getElementById('contactForm-Email').value
        const subject = document.getElementById('contactForm-Subject').value
        const message = document.getElementById('contactForm-Message').value
        console.log(name);

        const data = {name: name, email: email, subject: subject, message: message}
        Axios.post('/organisation/homepageContact', data)
        .then(res => {
            if(res.data.message == 'Email Sent') {
                UpdateFormSettings(dispatch, true);
            }
        })
        .catch(err => {
            console.log(err);
        })
    }

    return (<div>
    <br />
    <Row>
        <Col sm={2}>

        </Col>
        <Col sm={8}>
        {!HomePageGlobalSettings.formSent ? (<div>
            <Form className='home-contact'>
            <Form.Group>
                <Form.Label>Name:</Form.Label>
                <Form.Control type='textbox' id='contactForm-Name' required />
            </Form.Group>
            <Form.Group>
                <Form.Label>Email:</Form.Label>
                <Form.Control type='email' id='contactForm-Email' required />
            </Form.Group>
            <Form.Group>
                <Form.Label>Subject:</Form.Label>
                <Form.Control type='textbox' id='contactForm-Subject' required/>
            </Form.Group>
            <Form.Group>
                <Form.Label>Message:</Form.Label>
                <Form.Control as='textarea' rows={5} id='contactForm-Message' required />
            </Form.Group>
            <Button type='submit' onClick={onSubmit}>Submit</Button>
            </Form></div>) : (<div className='home-contact-sent'>
                <p>Message Sent!</p>
                <p>Thank you for contacting My-STAFF at High-View Studios</p>
            </div>)}
            
        </Col>
        <Col sm={2}>

        </Col>
    </Row>
    </div>)
}

export default Contact;