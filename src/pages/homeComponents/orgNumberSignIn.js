import React from 'react';
import { Form, Button } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';

function OrgNumberSignIn() {

    const history = useHistory();

    function onSubmit() {

        const number = document.getElementById('org-number').value;

        history.push('/org/' + number + '/');
    }

    function isNumberInput(event) {

        var char = String.fromCharCode(event.which);

        if(!(/[0-9]/.test(char))) {
            event.preventDefault();
        }
    }

    return ( <div className='orgNumber-style'>
        If you know your organisation's number, please enter it below, <br /><br />

        <div className='orgNumber-alignLeft'>
            <strong>Organisation Number:</strong> <br />
            <Form.Control type='textbox' id='org-number' onKeyPress={isNumberInput} />
            <Button variant='primary' onClick={onSubmit}>Submit</Button> <br /><br />
            <strong>Don't know the organisation's number?</strong><br />
            Locate the Senior admin of your organisation or find your registration email to locate the direct URL 
        </div>
    </div>)
}

export default OrgNumberSignIn;