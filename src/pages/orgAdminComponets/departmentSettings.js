import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { orgUpdateUseDepartments, orgUpdateNoOfDepartments, orgUpdateDepartments } from "../../store/actions/organistion";
import Axios from 'axios';

import Button from "react-bootstrap/Button"
import Collapse from "react-bootstrap/Collapse";
import Form from "react-bootstrap/Form";
import { Row, Col, ListGroup, Modal } from 'react-bootstrap';
import Image from 'react-bootstrap/Image';
import plus from "../../public/images/plus.png";
import minus from "../../public/images/minus.png";


function DepartmentSettings(props) {

    const orgID = props.orgID;

    const organisation = useSelector(state => state.organisation);    
    const dispatch = useDispatch();

    const [remove, setRemove] = useState({
        uuid: 0,
        activeRemove: false
    });

    const [departments, setDepartments] = useState({
        open: false,
        saved: false,
        showSave: false,
        useDepartments: false,
        aname: '',
        names: []
    });

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
    })
    }

    function openDepartments() {

        if(!departments.open) {
            setDepartments(prevState => {
                return {...prevState,
                    useDepartments: organisation.useDepartments,
                    names: organisation.departments,
                    open: true
                }
            })
        } else {
            setDepartments(prevState => {
                return {...prevState,
                    open: false
                }
            })
        }
    }

    function handleChecked(event) {

        const {name, checked} = event.target;
        console.log(checked);

       setDepartments(prevState => {
            return {...prevState, [name]: checked,
            showSave: true}
        });

        const data = {useDepartments: checked.toString(), orgID: orgID};

        Axios.post('/organisation/updateUseDepartments', data)
        .then(res => {
            console.log(res.data.useDepartments);

            dispatch(orgUpdateUseDepartments(departments.useDepartments));
        })
        .catch( err => {
            console.log(err);
        })
    }

    function handleChanged(event) {

        const {name, value} = event.target;

        setDepartments(prevState => {
            return {...prevState, [name]:value}
        })
    }

    function handleAddDepartment() {

        if(CheckDepartment(departments.aname)) {
            
            setModal(prevState => {
                return {...prevState,
                heading: 'Add Deparment',
                message: 'There is already a department with this name',
                open: true
            }
        });

        } else {
            const data = {orgID: orgID, departmentName: departments.aname};

            Axios.post('/organisation/addDepartment', data)
            .then(res => {
                console.log(res.data);
                dispatch(orgUpdateNoOfDepartments(res.data.noOfDepartments));
                dispatch(orgUpdateDepartments(res.data.departments));

                setDepartments(prevState => {
                    return {...prevState, names: res.data.departments,
                    aname: ''}
                });
            })
            .catch(err => {
                console.log(err);
            })
        }
    }

    function CheckDepartment(name) {
        let check = false;

        for(const department of organisation.departments) {
            if(department.name == name) {
                check = true;
                break;
            }
        }

        return check;
    }

    function handleRemoveDepartment() {
        if(remove.activeRemove) {

            const data = {orgID: orgID, uuid: remove.uuid}

            Axios.post('/organisatiton/removeDepartment', data)
            .then(res => {

                console.log(res.data);
                dispatch(orgUpdateDepartments(res.data.departments));

                setDepartments(prevState => {
                    return {...prevState, names: res.data.departments}
                });

                setRemove(preState => {
                    return {...preState, activeRemove: false }
                });
            })
            .catch(err => {
                console.log(err);
            });

        }
    }

    function handleItemOnClick(uuid) {
        setRemove(prevState => {
            return {...prevState, uuid: uuid, activeRemove: true}
        })

        console.log(uuid);
    }

    return (
        <div>
            <table width='100%' border='1px'>
                <thead>
                    <tr>
                        <th>
                        <div className="heading-text"> <Image className="plus-image" src={departments.open ? minus : plus} onClick={openDepartments} /> Departments</div><br />
                            <Collapse in={departments.open}>
                                <div>
                                    <div className='margin-text-hide'>
                                    -
                                    </div>
                                <div className="normal-text">
                                    <Row>
                                        <Col>
                                            <Form>
                                                <Form.Check id="chkUseDepartments" name="useDepartments" label="Use Departments" checked={departments.useDepartments} onChange={handleChecked}/><br />
                                                <p>Add new department:</p>
                                                <Form.Control type="text" value={departments.aname} name="aname" onChange={handleChanged} />
                                                <div className="add-button">
                                                    <Button onClick={handleAddDepartment}>Add</Button>
                                                </div>
                                            </Form>
                                        </Col>
                                        <Col>
                                            Departments:
                                            <div className="scrollable-300">
                                            <ListGroup>
                                                {departments.names.map((department, index) => {
                                                   return <ListGroup.Item key={index} action onClick={() => { handleItemOnClick(department.uuid) }}>{department.name}</ListGroup.Item>
                                                })}
                                            </ListGroup>
                                            </div>
                                            <div className={remove.activeRemove ? "remove-button-show" : "remove-button-hidden"}>
                                                    <Button onClick={handleRemoveDepartment}>Remove</Button>
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                          </div>
                            </Collapse>
                        </th>
                    </tr>
                </thead>
            </table>
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
        </div>
    )
}

export default DepartmentSettings;