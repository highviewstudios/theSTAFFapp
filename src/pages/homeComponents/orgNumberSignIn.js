import React, { useState } from 'react';
import { Form, Button, Modal } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { UpdateDataErrorSetting } from '../../globalSettings/homePageSettings';
import {useSelector, useDispatch} from 'react-redux';
import axios from 'axios';

function OrgNumberSignIn() {

    const history = useHistory();
    const dispatch = useDispatch();
    const globalVars = useSelector(state => state.globalVars);

    const [modal, setModal] = useState({
        open: false,
        heading: '',
        message: ''
    });

    function handleModalClose() {
        setModal(prevState => {
            return {...prevState,
            open: false
        }
    });
    }

    function onSubmit() {

        const number = document.getElementById('org-number').value;

        if(number == '') {
            setModal({heading: 'Error!', message: 'Please enter an organisation number', open: true});
        } else {
            
            const data = {orgID: number};
            axios.post('/organisation/goToPortal', data)
            .then(res => {
                const data = res.data;

                if(data.error == 'No') {
                    history.push('/org/' + number);
                } else {
                    if(data.dataError == 'Yes') {
                        UpdateDataErrorSetting(dispatch, true);
                    } else {
                        UpdateDataErrorSetting(dispatch, false);
                    }
                    history.push('/organisationNotFound');
                }
            })
            .catch(err => {
                console.log(err)
            })
            

        }
    }

    function isNumberInput(event) {

        var char = String.fromCharCode(event.which);

        if(!(/[0-9]/.test(char))) {
            event.preventDefault();
        }
    }

    return ( <div className='orgNumber-style'>
        If you know your organisation's number, please enter it below, <br /><br />

        <div >
            <strong>Organisation Number:</strong> <br />
            <Form.Control type='textbox' id='org-number' onKeyPress={isNumberInput} />
            <Button variant='primary' onClick={onSubmit}>Go To My Portal</Button> <br /><br />
            <strong>Don't know the organisation's number?</strong><br />
            Locate the Senior admin of your organisation or find your registration email to locate the direct URL 
        </div>

        <Modal show={modal.open} onHide={handleModalClose}>
                <Modal.Header closeButton>
                <Modal.Title>{modal.heading}</Modal.Title>
                </Modal.Header>
                <Modal.Body>{modal.message}</Modal.Body>
                <Modal.Footer>
                <Button variant="primary" onClick={handleModalClose}>
                    Close
                </Button>
                </Modal.Footer>
            </Modal>
    </div>)
}

export default OrgNumberSignIn;