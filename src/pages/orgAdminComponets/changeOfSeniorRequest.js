import Axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Button, Col, Container, Jumbotron, Row, Modal } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { userUpdateRole, userUpdateSARequest} from '../../store/actions/user';
import { useHistory } from 'react-router-dom';

function ChangeOfSeniorRequest(props) {

    const orgID = props.match.params.id;
    const user = useSelector(state => state.user);
    const dispatch = useDispatch();
    const history = useHistory();

    const [settings, setSettings] = useState({
        organisation: {}
    });

    const [modal, setModal] = useState({
        open: false,
        heading: '',
        message: ''
    });

    function handleModalClose() {
        
        history.replace('/');
        
        setModal(prevState => {
            return {...prevState,
            open: false
        }
    })
    }

    useEffect(() => {
        onOpen();
    }, [])

    function onOpen() {

        const data = {orgID: orgID}
        Axios.post('/organisation/getSARData', data)
        .then(res => {
            console.log(res.data.org);
            setSettings({organisation: res.data.org});
        })
        .catch(err => {
            console.log(err);
        })
    }

    function handleAccept() {

        const data = {orgID, orgID, invate: 'Accept', newUserID: user.uuid}
        Axios.post('/organisation/SAInvate', data)
        .then(res => {
            console.log(res.data);
            if(res.data.message == 'Senior Admin Updated') {
                dispatch(userUpdateRole(res.data.role));
                dispatch(userUpdateSARequest(''));

                setModal({heading: 'Request Accepted', open: true})
            }
        })
        .catch(err => {
            console.log(err);
        })
    }

    function handleDecline() {

        const data = {orgID, orgID, invate: 'Decline', newUserID: user.uuid}
        Axios.post('/organisation/SAInvate', data)
        .then(res => {
            
            if(res.data.message =='Senior Admin Request Declined') {
                dispatch(userUpdateSARequest(''));

                history.replace('/');
            }
        })
        .catch(err => {
            console.log(err);
        })
    }

    return (
        <div className='body changeOfSenior'>
        <Container className="p-3">
            <Jumbotron className="back-color">
                <h1>Change of Senior Admin Request</h1><br/>
                <p>You are viewing this screen because {settings.organisation.POC_Name} has requested a change of Senior Admin role to you. </p>
                <p>This means that you will be responible for the admin side of your organisation.</p>
                <p>If you require help, please speak to {settings.organisation.POC_Name} or contact High-View Studios</p>
                <p>Do you want to Accept or Decline this invitation?</p>
                <Row>
                    <Col>
                        <Button variant='primary' onClick={handleAccept}>Accept</Button>
                    </Col>
                    <Col>
                        <Button variant='primary' onClick={handleDecline}>Decline</Button>
                    </Col>
                </Row>
            </Jumbotron>
        </Container>
        <Modal show={modal.open} onHide={handleModalClose}>
                <Modal.Header>
                <Modal.Title>{modal.heading}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                <p>You are now the Senior Admin of this organisation.</p>
                <p>To get to the Admin side, go on the organisation page drop-down at the top-right of the screen</p>
                </Modal.Body>
                <Modal.Footer>
                <Button variant="primary" onClick={handleModalClose}>
                    Close
                </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default ChangeOfSeniorRequest;