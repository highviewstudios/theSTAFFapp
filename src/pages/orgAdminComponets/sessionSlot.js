import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Row, Col } from 'react-bootstrap';
import { toggleBreakBtns, updateCustomText, updateHoverText } from '../../globalSettings/adminLayoutsSettings';

function SessionSlot(props) {

    const AdminLayoutsGlobalSettings = useSelector(state => state.AdminLayoutsGlobalSettings);
    const dispatch = useDispatch();

    function handleChangeCustomText(event) {

        const { value } = event.target;

       updateCustomText(AdminLayoutsGlobalSettings, dispatch, props.id, value);
        
    }

    function handleChangeHoverText(event) {

        const { value } = event.target;

        updateHoverText(AdminLayoutsGlobalSettings, dispatch, props.id, value);
    }

    function handleBreakBtns() {
        toggleBreakBtns(dispatch, 0, false);
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