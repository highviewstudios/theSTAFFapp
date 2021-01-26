import React from 'react';
import { useDispatch } from 'react-redux';
import { UpdateTab } from '../../globalSettings/homePageSettings';

import {Row, Col, Image, Card, Button} from 'react-bootstrap';

import screenTimetable from '../../public/images/screen-timetable.png'
import screenDiary from '../../public/images/screen-diary.png'

function HomePage() {

    const dispatch = useDispatch();

    function onClickContact() {
        UpdateTab(dispatch, 'contact');
    }

    return (<div>

        <Row>
            <Col>
                <Image className='home-img' src={screenTimetable}/>
            </Col>
            <Col>
                <Image className='home-img' src={screenDiary}/>
            </Col>
            </Row>
            <br />
            <Row>
            <Col className='home-alignLeft'>
                <h2 className='blue-heading'><strong>Your very own room booking portal!</strong></h2>
                <p className='home-text'>With a My STAFF account, your organisation will have its own portal where all your users can book out rooms for education, office meeting rooms and lots more. 
                With the very dymanic design you can create the rooms to suit your needs. From a timetable format to a 24-hour diary format. If you have two rooms that require a timetable format but each
                room requires a slightly different format, this system can provide you with that functionality. Have a system so users within your organisation can book out any, or paricular rooms, in seconds!</p>
            </Col>
        </Row>
        <br /> <br/>
        <Row>
            <Col>
                <Card className='home-card'>
                    <Card.Title className='home-cardTitle'>1 - 5 Rooms</Card.Title>
                    <Card.Body>
                        2.99 per room <br /> per month
                        <br /> <br />
                        <Button variant='primary' onClick={onClickContact}>Contact</Button>
                    </Card.Body>
                </Card>
            </Col>
            <Col>
                <Card className='home-card'>
                    <Card.Title className='home-cardTitle'>6 - 10 Rooms</Card.Title>
                    <Card.Body>
                        £2.50 per room <br /> per month
                        <br /> <br />
                        <Button variant='primary' onClick={onClickContact}>Contact</Button>
                    </Card.Body>
                </Card>
            </Col>
            <Col>
                <Card className='home-card'>
                    <Card.Title className='home-cardTitle'>11 - 20 Rooms</Card.Title>
                    <Card.Body>
                        £1.99 per room <br /> per month
                        <br /> <br />
                        <Button variant='primary' onClick={onClickContact}>Contact</Button>
                    </Card.Body>
                </Card>
            </Col>
            <Col>
                <Card className='home-card'>
                    <Card.Title className='home-cardTitle'>21 Rooms +</Card.Title>
                    <Card.Body>
                        £0.99 per room <br /> per month
                        <br /> <br />
                        <Button variant='primary' onClick={onClickContact}>Contact</Button>
                    </Card.Body>
                </Card>
            </Col>
        </Row>

    </div>)
}

export default HomePage;