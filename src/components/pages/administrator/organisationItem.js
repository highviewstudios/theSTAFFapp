import React from 'react';
import Card from "react-bootstrap/Card";
import { Row, Col } from 'react-bootstrap';

function OrganisationItem(props) {
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
                    <label>{props.id}</label>
                </Col>
            </Row>
            </Card>
        </div>
    )
}

export default OrganisationItem;