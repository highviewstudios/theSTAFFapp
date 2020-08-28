import React, { useContext } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { SessionsContext } from "../../context/adminTemplatesSessions";

function SessionSlot(props) {

    const { updateCustomText, updateHoverText, toggleBreakBtns } = useContext(SessionsContext);

    function handleChangeCustomText(event) {

        const { value } = event.target;

       updateCustomText(props.id, value);
        
    }

    function handleChangeHoverText(event) {

        const { value } = event.target;

        updateHoverText(props.id, value);
    }

    function handleBreakBtns() {
        toggleBreakBtns(0, false);
    }

    return (
        <div>
            <Row>
                <Col sm={1}>
                <div className="slot-id">
                    {props.id}
                </div>
                </Col>
                <Col>
                <Form.Control id="txtCustomText" type='text' value={props.customText} onFocus={handleBreakBtns} onChange={handleChangeCustomText}/>
                </Col>
                <Col>
                <Form.Control id="txtHoverText" type='text' value={props.hoverText} onFocus={handleBreakBtns} onChange={handleChangeHoverText}/>
                </Col>
            </Row>
        </div>
    )
}

export default SessionSlot;