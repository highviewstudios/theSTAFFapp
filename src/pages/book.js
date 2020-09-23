import React, {useEffect, useState, useContext} from 'react';
import { Container, Jumbotron, Row, Col, Form, Button, Dropdown, Modal } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Axios from 'axios';
import DatePicker from "react-datepicker";
import moment from 'moment';
 
import "react-datepicker/dist/react-datepicker.css";

function Book(props) {

    const orgID = props.match.params.id;
    const history = useHistory();

    const user = useSelector(state => state.user);
    const organisation = useSelector(state => state.organisation);
    const globalVars = useSelector(state => state.globalVars);

    const [settings, setSettings] = useState({
        userList: [],
        departmentList: [],
        user: 'Users',
        userID: '',
        department: 'Departments',
        departmentID: '',
        sessionLength: 'Length',
        sessionLengthTitle: '',
        showSessionLength: true,
        sessions: [],
        repeat: false,
        daily: false,
        weekly: false,
        endOfYear: false,
        untilDate: moment(),
        showUserDropdown: true,
        sessDes: '',
        sessDesTitle: '',
        comments: '',
        times: []
    });

    const [modal, setModal] = useState({
        open: false,
        heading: '',
        message: '',
    });

    function handleModalClose() {
        setModal(prevState => {
            return {...prevState,
            open: false
        }
    });
    }

    useEffect(() => {
        if(globalVars.date == '') {
            history.push('/org/' + orgID);
        } else {
            onOpen();
        }
    }, []);

    function onOpen() {

        if(user.role != 'user') {
            FetchUsersAndDepartments();
        } else {
            FetchUserDepartments();

            setSettings(prevState => {
                return {...prevState, showUserDropdown: false, user: user.name, userID: user.uuid}
            });
        }
        if(globalVars.layoutData.layout == 'Timetable') {
            if(globalVars.sessionID.includes('b')) {
                
                setSettings(prevState => {
                    return {...prevState, showSessionLength: false, sessionLength: '1'};
                })
            } else {
                const IDs = globalVars.sessionID.split('-');
                const firstIndex = parseInt(IDs[1]);
                
                let sessions = [];
                let sess = 1;
                for(let i = firstIndex; i <= globalVars.totalSessions; i++) {
                    sessions.push(sess);
                    sess++;
                }
                setSettings(prevState => {
                    return {...prevState, sessions: sessions}
                });
            }
            //Change Titles
            setSettings(prevState => {
                return {...prevState, sessDesTitle: 'Class', sessionLengthTitle: 'Session Length'};
            });

        } else if(globalVars.layoutData.layout == 'Diary') {

            const sTime = moment(globalVars.sessionLabel, 'HH:mm');

            BuildTimes(sTime, globalVars.finishTime, globalVars.timeInterval);

            //Change Titles
            setSettings(prevState => {
                return {...prevState, sessDesTitle: 'Subject', sessionLengthTitle: 'Until'};
            });
        }

        const currentDate = moment(globalVars.date, 'DD/MM/YYYY');

        setSettings(prevState => {
            return {...prevState, untilDate: currentDate};
        })
    }

    function FetchUsersAndDepartments() {

        const data = {orgID: orgID, users: true, departments: true}

        Axios.post('/organisation/usersAndDepartments', data)
        .then(res => {
            const data = res.data;
            if(data.userList != 'none') {
                setSettings(prevState => {
                    return {...prevState, userList: data.userList};
                })
            }
            if(data.departmentList != 'none') {
                setSettings(prevState => {
                    return {...prevState, departmentList: data.departmentList}
                })
            }
        })
        .catch(err => {
            console.log(err);
        })
    }

    function FetchUserDepartments() {

        const userDepartments = user.userDepartments.split(',');
        let departments = [];

        for(const depIndex of userDepartments) {
            
            for(const department of organisation.departments) {
                if(department.uuid == depIndex) {
                    departments.push(department);
                }
            }
        }

        setSettings(prevState => {
            return {...prevState, departmentList: departments};
        });
    }

    //Dropdowns select functions
    function handleUsersDropdownItem(name, uuid) {

        setSettings(prevState => {
            return {...prevState, user: name, userID: uuid};
        });
    }

    function handleDepartmentsDropdownItem(name, id) {

        setSettings(prevState => {
            return {...prevState, department: name, departmentID: id};
        });

        console.log(globalVars.roomID);
    }

    function handleSessionsDropdownItem(event) {

        const { innerText} = event.target;

        setSettings(prevState => {
            return {...prevState, sessionLength: innerText};
        });
    }

    function handleRepeatCheckChanged(event) {

        const { checked } = event.target;

        setSettings(prevState => {
            return {...prevState, repeat: checked}
        })
    }

    function handleDailyCheckChanged(event) {

        const { checked } = event.target;

        if(!checked) {
            setSettings(prevState => {
                return {...prevState, daily: checked}
            });
        } else {
            setSettings(prevState => {
                return {...prevState, daily: checked, weekly: !checked, endOfYear: !checked}
            });
        }
    }

    function handleWeeklyCheckChanged(event) {

        const { checked } = event.target;

        if(!checked) {
            setSettings(prevState => {
                return {...prevState, weekly: checked}
            });
        } else {
            setSettings(prevState => {
                return {...prevState, weekly: checked, daily: !checked, endOfYear: !checked}
            });
        }
    }

    function handleEndOfYearCheckChanged(event) {

        const { checked } = event.target;

        if(!checked) {
            setSettings(prevState => {
                return {...prevState, endOfYear: checked}
            })
        } else {
            setSettings(prevState => {
                return {...prevState, endOfYear: checked, daily: !checked, weekly: !checked}
            })

            endOfYearDate();
        }
    }

    function endOfYearDate() {

        let endDate = moment();
        const today = moment();

        if(today.month() > 6) {
            const date = moment('31/07/' + today.year(), 'DD/MM/YYYY');
            date.add(1, 'y');
            endDate = moment(date, 'DD/MM/YYYY');
        } else {
            const date = moment('31/07/' + today.year(), 'DD/MM/YYYY');
            endDate = moment(date, 'DD/MM/YYYY');
        }

        setSettings(prevState => {
            return {...prevState, untilDate: new Date(endDate)}
        })
    }

    function handleDateChange(date) {
        
        setSettings(prevState => {
            return {...prevState, untilDate: date }
        });
    }

    function handleTextBoxChange(event) {

        const { name, value } = event.target;

        setSettings(prevState => {
            return {...prevState, [name]:value}
        });
    }

    function handleBook() {

        const today = moment();
        if(settings.user == 'Users') {
            setModal({heading: 'Booking', message:'Please select an user', open: true});

        } else if(settings.department == 'Departments') {
            setModal({heading: 'Booking', message:'Please select a department', open: true});

        } else if(settings.sessionLength == 'Length') {
            setModal({heading: 'Booking', message:'Please select a session length', open: true});

        } else if(settings.sessDes == '') {
            setModal({heading: 'Booking', message:'Please put a class', open: true});

        } else if(settings.repeat) {
            if(!settings.daily && !settings.weekly && !settings.endOfYear) {
                setModal({heading: 'Booking', message:'Please select a repeat method', open: true});

            } else{
                const uDate = moment(settings.untilDate, 'DD/MM/YYYY');
                const cDate = moment(globalVars.date, 'DD/MM/YYYY');
                if(uDate.isSameOrBefore(cDate)) {
                    setModal({heading: 'Booking', message:'Please select a date after the selected booking date', open: true});
                } else {
                    const cDate = moment(globalVars.date, 'DD/MM/YYYY');
                    cDate.add(2, 'y');
                    if(uDate.isAfter(cDate)) {
                        setModal({heading: 'Booking', message:'You cannot repeat a booking for more than two years.', open: true});
                    } else {
                        BookSession();
                    }

                    
                }
            }
        } else {
            BookSession();
        }
    }

    function BookSession() {

        let bookingType = '';
        let repeatType = '';
        let repeatUntil = '';
        let sessions = [];

        const IDs = globalVars.sessionID.split('-');

        if(globalVars.layoutData.layout == 'Timetable') {
            if(!IDs[1].toString().includes('b')) {

                let firstIndex = parseInt(IDs[1]);

                for(var i = 0; i < settings.sessionLength; i++) {
                    sessions.push(firstIndex);
                    firstIndex++;
                }
            } else {
                sessions.push(IDs[1]);
            } 
        } else if (globalVars.layoutData.layout == 'Diary') {

            let sTime = moment(globalVars.sessionLabel, 'HH:mm');
            const fTime = moment(settings.sessionLength, 'HH:mm');
            
            while (sTime.isBefore(fTime)) {
                sessions.push(sTime.format('HH:mm').replace(':', ''));
                sTime.add(globalVars.timeInterval, 'm');
            }
        }

        if(settings.repeat) {
            bookingType = 'repeat';

            if(settings.daily) {
                repeatType = 'daily';
                repeatUntil = settings.untilDate.toLocaleDateString();
            } else if(settings.weekly || settings.endOfYear) {
                repeatType = 'weekly';
                repeatUntil = settings.untilDate.toLocaleDateString();
            }
        } else {
            bookingType = 'single';
            repeatUntil = ''
        }

        //WEEK SYSTEM
        let weekSysWeeks = '';
        for(const holiday of organisation.holidays) {
            if(holiday.titleUUID == globalVars.weekUUID) {
                weekSysWeeks = holiday.weeks;
                break;
            }
        }

        //DATES
        let startDate = moment(globalVars.date, 'DD/MM/YYYY');

        let finishDate;
        if(bookingType == 'repeat') {
            const fDates = moment(repeatUntil, 'DD/MM/YYYY');
            finishDate = fDates.format('DD/MM/YYYY');
        } else {
            finishDate = '';
        }

        const data = {orgID: orgID,roomID: globalVars.roomID, user: settings.userID, departmentID: settings.departmentID, sessionDes: settings.sessDes, sessionTotal: sessions.length,
                        sessions: sessions.toString(), comments: settings.comments, bookingType: bookingType, repeatType: repeatType, startDate: startDate.format('DD/MM/YYYY'), 
                        repeatUntil: finishDate, createdBy: user.uuid, dayList: globalVars.dayList, weekSystem: globalVars.weekSystem, weekSysWeeks: weekSysWeeks};
        
        Axios.post('/booking/createBooking', data)
        .then(res => {
            const data = res.data;
            if(data.error == 'null') {
                if(data.userError == 'null') {
                    history.push('/org/' + orgID);
                } else {
                    setModal(() => {
                        return {heading: 'Booking', message: data.message, open: true}
                    });
                }

            } else {
                setModal(() => {
                    return {heading: 'Booking', message: data.message, open: true}
                });
            }
        })
        .catch(err => {
            console.log(err);
        })
    }

    function BuildTimes(sTime, fTime, interval) {

        const ti = [];
        
        const start = moment(sTime, "HH:mm");
        const finish = moment(fTime, "HH:mm");

        start.add(interval, 'm');

        while(start.isSameOrBefore(finish)) {
            ti.push(start.format("HH:mm"));
            start.add(interval, 'm');
        }

        setSettings(prevState => {
            return {...prevState, sessions: ti}
        });

        console.log(ti);
        
    }

    return (
        <div className="body booking-content">
            <Container fluid className="p-3">
                <Jumbotron className="back-color">
                    <Row>
                        <Col></Col>
                        <Col xs={8}>
                            <Row>
                                    <Col className='booking-topInfo'><strong>Date: {globalVars.date}</strong></Col>
                                    <Col className='booking-topInfo'><strong>Room: {globalVars.roomName}</strong></Col>
                                    <Col className='booking-topInfo'><strong>Session: {globalVars.sessionLabel}</strong></Col>
                            </Row>
                            <hr />
                            <Row>
                                <Col>
                                <Form.Group>
                                    User: 
                                    {settings.showUserDropdown ? (<div>
                                        <Dropdown>
                                        <Dropdown.Toggle variant='primary' id='dropdown-users'>
                                            {settings.user}
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu className='dropdown-items'>
                                            {settings.userList.map((user, index) => {
                                                return <Dropdown.Item key={index} onClick={() => handleUsersDropdownItem(user.displayName, user.uuid)}>{user.displayName}</Dropdown.Item>
                                            })}
                                        </Dropdown.Menu>
                                    </Dropdown>
                                    </div>) : (<div>{settings.user}</div>)}
                                    
                                </Form.Group>
                                <Form.Group>
                                        Department:
                                        <Dropdown>
                                            <Dropdown.Toggle variant='primary' id='dropdown-departments'>
                                                {settings.department}
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu className='dropdown-items'>
                                                {settings.departmentList.map((department, index) => {
                                                    return <Dropdown.Item key={index} onClick={() => handleDepartmentsDropdownItem(department.name, department.uuid)}>{department.name}</Dropdown.Item>
                                                })}
                                            </Dropdown.Menu>
                                        </Dropdown>
                                </Form.Group>
                                <Form.Group>
                                    {settings.sessDesTitle}:
                                    <Form.Control type='text' name='sessDes' onChange={handleTextBoxChange}/>
                                </Form.Group>
                                <Form.Group>
                                    Comments:
                                    <Form.Control as='textarea' rows='3' name='comments' onChange={handleTextBoxChange}>

                                    </Form.Control>
                                </Form.Group>
                                </Col>
                                <Col>
                                        <Form.Group>
                                        {settings.sessionLengthTitle}:
                                        {settings.showSessionLength ? (<div>
                                            <Dropdown>
                                                <Dropdown.Toggle variant='primary' id='dropdown-sessionLength'>
                                                    {settings.sessionLength}
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu className='dropdown-items'>
                                                {settings.sessions.map((session, index) => {
                                                    return <Dropdown.Item key={index} onClick={handleSessionsDropdownItem}>{session}</Dropdown.Item>
                                                })}
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </div>) : " " + settings.sessionLength }
                                        
                                        </Form.Group>   
                                    <Row>
                                    {user.role != 'user' ? (<div>
                                        <Form.Group>
                                            <Form.Check className="check-side-by-side-b" type="checkbox" label="Repeat" onChange={handleRepeatCheckChanged} />
                                        </Form.Group>
                                    </div>) : null}
                                        
                                    </Row>
                                    {settings.repeat ? (<div>
                                        <Row>
                                        <Form.Group>
                                            <Form.Check className="check-side-by-side-b" type="checkbox" label="Daily" checked={settings.daily} onChange={handleDailyCheckChanged} />
                                            <Form.Check className="check-side-by-side" type="checkbox" label="Weekly" checked={settings.weekly} onChange={handleWeeklyCheckChanged}/>
                                            <Form.Check className="check-side-by-side" type="checkbox" label="End of Year (Weekly)" checked={settings.endOfYear} onChange={handleEndOfYearCheckChanged} />
                                        </Form.Group>
                                    </Row>
                                        <Row>
                                        <Col></Col>
                                        <Col>
                                            <Form.Group>
                                            Until:<br />
                                            <DatePicker dateFormat='dd/MM/yyyy' selected={new Date(settings.untilDate)} onChange={handleDateChange}/>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    </div>) : null}
                                    
                                    <div className='add-button'>
                                        <Button variant='primary' onClick={handleBook}>Book</Button>
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                        <Col></Col>
                    </Row>
                </Jumbotron>
            </Container>
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

export default Book;