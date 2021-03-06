import React, { useState } from 'react';
import { Row, Col, Form, Dropdown, Modal, Button } from 'react-bootstrap';
import { CompactPicker } from 'react-color';
import { useDispatch, useSelector } from 'react-redux';
import { toggleBreakBtns, updateBreakText, updateBreakColor } from '../../globalSettings/adminLayoutsSettings';

function BreakSlot(props) {

    const AdminLayoutsGlobalSettings = useSelector(state => state.AdminLayoutsGlobalSettings);
    const dispatch = useDispatch();

    const [colorModal, setColorModal] = useState({
        open: false,
        color: "ff0000",
        property: ''
    });

    function handleModalClose() {
        setColorModal(prevState => {
            return {...prevState,
            open: false
        }
    });
    }

    function handleBreakBtns() {
        toggleBreakBtns(dispatch, props.id, true);
    }

    function handleChangeText(event) {

        const { value } = event.target;

        updateBreakText(AdminLayoutsGlobalSettings, dispatch, value);
    }

    function handleOpenColorModal_TextColor() {
        
        toggleBreakBtns(dispatch, props.id, true);
        setColorModal(prevState => {
            return {...prevState, open: true, property: 'textColor'}
        })
    }

    function handleOpenColorModal_BgColor() {
        
        toggleBreakBtns(dispatch, props.id, true);
        setColorModal(prevState => {
            return {...prevState, open: true, property: 'bgColor'}
        })
    }

    function handleModelPickColor() {
        updateBreakColor(AdminLayoutsGlobalSettings, dispatch, colorModal.property, colorModal.color)
        setColorModal(prevState => {
            return {...prevState,
            open: false
        }});
    }

    function SetColorInModal(color) {

        setColorModal(prevState => {
            return {...prevState, color: color}
        })
    }

    return (
        <div>
            <Row>
                <Col sm={1}>
                    <div className='break-id'>
                        {props.id}
                    </div>
                </Col>
                <Col className='break-padding'>
                    <Form.Control style={{backgroundColor:props.bgColor, color:props.textColor}} id='txtbreakText' value={props.breakText} onFocus={handleBreakBtns} onChange={handleChangeText}/>
                </Col>
                <Col>
                <Dropdown className='side-by-side'>
                    <Dropdown.Toggle variant='primary' id="dropdown-layouts">
                        Colour
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item onClick={handleOpenColorModal_TextColor}>Text Colour</Dropdown.Item>
                        <Dropdown.Item onClick={handleOpenColorModal_BgColor}>BackgroundColour</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
                </Col>
            </Row>

            <Modal show={colorModal.open} dialogClassName="color-modal-90w" onHide={handleModalClose}>
                <Modal.Header closeButton>
                <Modal.Title>Pick Colour</Modal.Title>
                </Modal.Header>
                <Modal.Body><CompactPicker color={colorModal.color} onChangeComplete={(color) => {SetColorInModal(color.hex)}} />
                </Modal.Body>
                <Modal.Footer>
                <Button variant="primary" onClick={handleModelPickColor}>
                    OK
                </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default BreakSlot;