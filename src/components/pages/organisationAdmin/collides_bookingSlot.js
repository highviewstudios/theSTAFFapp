import React from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';
import Axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { CollideBookingsForceUpdate } from '../../../store/actions/globalVars';

function Collides_bookingSlot(props) {

    const dispatch = useDispatch();
    const globalVars = useSelector(state => state.globalVars);

    function handleDelete(uuid) {
        
        const data = {orgID: props.orgID, bookingUUID: uuid};
        Axios.post('/collide/deleteBooking', data)
        .then(res => {
            const data = res.data;

            if(data.error == 'null') {
                if(!globalVars.collideBookingsUpdate) {
                    dispatch(CollideBookingsForceUpdate(true));
                } else {
                    dispatch(CollideBookingsForceUpdate(false));
                }
            }
        })
        .catch(err => {
            console.log(err);
        })
    }

    return (
        <div>
            <Card body className='collides_bookingSlot'>
                 <Row>
                    Booking - Room: {props.roomName}
                </Row>
                <Row>
                    <Col>
                        User: <br />{props.user}
                    </Col>
                    <Col>
                        Description: <br/>{props.sessionDes}
                    </Col>
                    <Col>
                        Booking Type:<br /> {props.bookingType} - {props.repeatType}
                    </Col>
                    <Col>
                        Start Date: <br/> {props.startDate}
                    </Col>
                    <Col>
                        Session: {props.session}
                    </Col>
                    <Col>
                        Session Length: {props.sessionTotal}
                    </Col>
                    <Col>
                        <Button variant='primary' onClick={() => handleDelete(props.uuid)}>Delete</Button>
                    </Col>
                </Row>
            </Card>
        </div>
    )
}

export default Collides_bookingSlot;