import React, {useState} from 'react';
import Card from "react-bootstrap/Card";
import { Row, Col, Dropdown, Modal, Button} from 'react-bootstrap';
import Axios from 'axios';

function OrganisationItem(props) {

    const [modalYN, setModalYN] = useState({
        open: false,
        heading: '',
        message: '',
        acceptFunction: '',
        acceptName: '',
        showAccept: false,
        cancelName: '',
        showCancel: false
    });

    function handleModalYNClose() {
        setModalYN(prevState => {
            return {...prevState,
            open: false
        }
    });
    }

    function handleModalClose() {
        setModal(prevState => {
            return {...prevState,
            open: false
        }
    });
    }

    const [modal, setModal] = useState({
        open: false,
        heading: '',
        message: ''
    });

    function ChangeLoginMethod(name, email, orgID) {

        const data = {email: email};

        Axios.post('/organisation/getSALoginMethod', data)
        .then(res => {
            const method = res.data.method;
            let newMethod;
            if(method == 'local') {
                newMethod = 'google'
            } else if(method == 'google') {
                newMethod = 'local'
            }
            const message = name + "'s login method is " + method + ". Are you sure you want to change it to a " + newMethod + " method?";

            setModalYN({heading: 'Change Login Method', message: message, acceptName: 'Yes', acceptFunction: () => {acceptToChangeMethods(email, newMethod, orgID)}, showAccept: true, cancelName: 'No', showCancel: true, open: true});    
        })
        .catch(err => {
            console.log(err);
        })
    }

    function acceptToChangeMethods(email, method, orgID) {

        setModalYN({open: false});

        const data = {email: email, method: method, orgID: orgID};
        Axios.post('/organisation/changeASLoginMethod', data)
        .then(res => {
            if(res.data.message == 'Strategy Updated') {
                setModal({heading: 'Change Login Method', message: "This user's login method has now been changed", open: true})
            }
        })
        .catch(err => {
            console.log(err);
        })
    }

    return (
        <div>
            <Card body className='Organisations-ListBox'>
            <Row>
                <Col>
                    <label>{props.name}</label>
                </Col>
                <Col>
                    <label>{props.email}</label>
                </Col>
                <Col>
                    <label>{props.poc}</label>
                </Col>
                <Col>
                    <label>{props.orgID}</label>
                </Col>
                <Col>
                <Dropdown>
                        <Dropdown.Toggle variant='primary'>
                            More
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => {ChangeLoginMethod(props.poc, props.email, props.orgID)}}>Change Login Method</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </Col>
            </Row>
            </Card>
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
            <Modal show={modalYN.open} onHide={handleModalYNClose}>
            <Modal.Header closeButton>
            <Modal.Title>{modalYN.heading}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{modalYN.message}</Modal.Body>
            <Modal.Footer>
            {modalYN.showAccept ? (<div>
                <Button variant="primary" onClick={modalYN.acceptFunction}>
                    {modalYN.acceptName}
                </Button>
            </div>) : null}
            {modalYN.showCancel ? (<div>
                <Button variant="primary" onClick={handleModalYNClose}>
                    {modalYN.cancelName}
                </Button>
            </div>) : null}
            </Modal.Footer>
        </Modal>
        </div>
    )
}

export default OrganisationItem;