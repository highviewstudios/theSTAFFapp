import React, { useState, useContext } from 'react';
import ReactTooltip from 'react-tooltip';
import plus from '../../public/images/plus.png';
import minus from '../../public/images/minus.png';
import {Image, Collapse, Row, Col, Dropdown, Form, Button, Modal} from 'react-bootstrap';
import { useDispatch } from 'react-redux';
//import {layoutsUpdateDiaryDays, layoutsUpdateStartTime, layoutsUpdateFinishTime, layoutsUpdateTimeInterval, layoutsUpdateTimetableDays, layoutsUpdateSessionTotal, layoutsUpdateBreakTotal, layoutsUpdateSessionOrder, layoutsUpdateSessions} from '../../store/actions/layouts';
import { SessionsContext } from '../../context/adminTemplatesSessions';

import SessionSlot from './sessionSlot';
import BreakSlot from './breakSlot';
import Axios from 'axios';
import moment from 'moment';

function Layouts(props) {

     const orgID = props.orgID;
     //const dispatch = useDispatch();
     
     const { sessions, order, breakBtns, addSession, minusSession, resetSessions, addBreak, orderMoveUp, orderMoveDown, removeBreak, SetSessions, SetOrder } = useContext(SessionsContext);

     const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

     const times = ['00:00', '00:30', '01:00', '01:30', '02:00', '02:30', '03:00', '03:30', '04:00', '04:30', '05:00', '05:30', '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', 
                    '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
                    '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'];

    const [settings, setSettings] = useState({
        open: false,
        layoutText: 'layout',
        yourLayoutText: 'Layouts',
        yourLayouts: [],
        currentLayout: {},
        sessions: 1,
        breaks: 0,
        days: [false, false, false, false, false, false, false],
        showPreview: false,
        startTime: 'Start Time',
        finishTime: 'Finish Time',
        timeIntervalLbl: 'Interval',
        timeInterval: 0,
        times: [],
        showTimetableSave: false,
        showDiarySave: false,
    });

    const [modal, setModal] = useState({
        open: false,
        heading: '',
        message: ''
    });

    const [addModal, setAddModal] = useState({
        open: false,
        heading: '',
        newName: ''
    });

    function handleModalClose() {
        setModal(prevState => {
            return {...prevState,
            open: false
        }
    });
    }

    function handleAddModalClose() {
        setAddModal(prevState => {
            return{...prevState, open: false}
        });
    }

    function openTab() {

        if(!settings.open) {

            const data = {orgID: orgID}
            Axios.post('/organisation/getLayouts', data)
            .then(res => {
                setSettings(prevState => {
                    return {...prevState, open: true, yourLayouts: res.data.layouts}
                });
            })
            .catch(err => {
                console.log(err);
            })

        } else {
            setSettings(prevState => {
                return {...prevState, open: false}
            });
            resetSessions();

        }
    }

    function handlePickLayout(uuid) {

        let currentLayout;
        resetSessions();
        
        setSettings(prevState => {
            return {...prevState, sessions: 0, breaks: 0}
        });
    
        for(const [index, layout] of settings.yourLayouts.entries()){
            if(layout.uuid == uuid) {
                currentLayout = layout
                break;
            }
        }
        let layout = 'layout';
        if(currentLayout.layout != '') {
            layout = currentLayout.layout
        }

        setSettings(prevState => {
            return {...prevState, yourLayoutText: currentLayout.name, layoutText: layout, currentLayout: currentLayout}
        });

        loadSettings(currentLayout);
    }

    function handleChangeLayout(event) {

        const { innerText } = event.target;

        let days = [false, false, false, false, false, false, false];

        let showTimetableSave = false;
        let showDiarySave = false;

        if(settings.currentLayout.layout == innerText) {
            loadSettings(settings.currentLayout);
        } else {
            if(innerText == 'Timetable') {
                setSettings(prevState => {
                    return {...prevState, sessions: 1}
                });
                addSession(1);

            } else if(innerText == 'Diary') {

            }
        }

        let show = false;
        for(const day of days) {
            if(day == true) {
                show = true;
            }
        }

        setSettings(preState => {
            return {...preState, layoutText: innerText, days: days, showDiarySave: showDiarySave, showTimetableSave: showTimetableSave, showPreview: show};
        });

    }

    function loadSettings(currentLayout) {

        if(currentLayout.layout == 'Timetable') {

            if(currentLayout.days != '') {

                let days = currentLayout.days.split(',');
                days.forEach((day, index) => {
                    days[index] = (day == 'true');
                });

                const data = {orgID: orgID, layoutUUID: currentLayout.uuid};
                Axios.post('/organisation/getTimetableSessions', data)
                .then(res => {
                    const sessions = res.data.sessions;
                    let newSessions = {};
                    for(const session of sessions) {
                        newSessions[session.id] = session;
                      }

                    SetSessions(newSessions);
                })
                .catch(err => {
                    console.log(err);
                })
                
                const order = currentLayout.sessionOrder.split(',');
                SetOrder(order);

                setSettings(prevState => {
                return {...prevState, open: true, sessions: currentLayout.sessions, breaks: currentLayout.breakTotal, days: days, showTimetableSave: true, showPreview: true}
                });

            }
        } else if(currentLayout.layout == "Diary") {

            let days = currentLayout.days.split(',');
            days.forEach((day, index) => {
                days[index] = (day == 'true');
            });

            if(currentLayout.days != '') {

                setSettings(prevState => {
                    return {...prevState, startTime: currentLayout.startTime, finishTime: currentLayout.finishTime, timeInterval: currentLayout.timeInterval, days: days,
                            showDiarySave: true, showPreview: true}
                });
                findIntervalText(currentLayout.timeInterval);
                BuildTimes(currentLayout.startTime, currentLayout.finishTime, currentLayout.timeInterval)
            }
        }
    }

    function findIntervalText(interval) {

        let lbl = ''
        if(interval == 30) lbl = '30 Minutes';
        if(interval == 60) lbl = '1 hour';
        if(interval == 90) lbl = '1 hour, 30 minutes';
        if(interval == 120) lbl = '2 hours';

        setSettings(prevState => {
            return {...prevState, timeIntervalLbl: lbl}
        })
    }

    //DIARY DROPDOWNS
    function handleChangeStartTime(event) {

        const { innerText } = event.target;

        setSettings(preState => {
            return {...preState, startTime: innerText};
        });

        BuildTimes(innerText, settings.finishTime, settings.timeInterval);
    }

    function handleChangeFinishTime(event) {

        const { innerText } = event.target;

        setSettings(preState => {
            return {...preState, finishTime: innerText};
        })

        BuildTimes(settings.startTime, innerText, settings.timeInterval);
    }

    function handleChangeInterval(event) {

        const { innerText, name } = event.target;

        setSettings(preState => {
            return {...preState, timeIntervalLbl: innerText, timeInterval: parseInt(name)};
        })

        BuildTimes(settings.startTime, settings.finishTime, parseInt(name));
    }
    //DIARY DROPDOWNS^^^

    function BuildTimes(sTime, fTime, interval) {

        const ti = [];
        if(sTime !== 'Start Time' && fTime !== 'Finish Time' && interval !== 0) {

            const start = moment(sTime, "HH:mm");
            const finish = moment(fTime, "HH:mm");

            while(start.isBefore(finish)) {
                ti.push(start.format("HH:mm"));
                start.add(interval, 'm');
            }

            setSettings(prevState => {
                return {...prevState, times: ti}
            });

            let show = false;

            for(const day in settings.days) {
                if(settings.days[day] == true) {
                    show = true;
                }
            }

            setSettings(prevState => {
                return {...prevState, showDiarySave: show}
            });
        }
        
    }

    //SESSIONS BUTTONS
    function handlePlusSessions() {

        setSettings(prevState => {
            return {...prevState, sessions: settings.sessions + 1}
        });

        addSession(settings.sessions + 1);
    }

    function handleMinusSessions() {

        if(settings.sessions > 1) {
            setSettings(prevState => {
                return {...prevState, sessions: settings.sessions - 1}
            });

            minusSession(settings.sessions);
        }

        
    }
    //SESSIONS BUTTONS^^^

    //BREAK BUTTONS
    function handleAddBreak() {

        setSettings(prevState => {
            return {...prevState, breaks: settings.breaks + 1}
        });

        addBreak(settings.breaks + 1);
    }

    function handleMoveBreakUp() {
        orderMoveUp();
    }

    function handleMoveBreakDown() {
        orderMoveDown();
    }

    function handleRemoveBreak() {

        setSettings(prevState => {
            return {...prevState, breaks: settings.breaks - 1}
        }); 
        removeBreak();
    }
    //BREAK BUTTONS^^^

    //DAYS CHECKBOXES
    function handleChecked(event) {

        const {name, checked} = event.target;

        const temp = settings.days;

        temp[name] = checked;

        let show = false;

        for(const day in temp) {
            if(temp[day] == true) {
                show = true;
            }
        }

        setSettings(prevState => {
            return {...prevState, days: temp, showPreview: show, showTimetableSave: show}
        });

        if(settings.layoutText == 'Diary' && settings.startTime !== 'Start Time' && settings.finishTime !== 'Finish Time' && settings.timeInterval !== 0) {
            setSettings(prevState => {
                return {...prevState, days: temp, showPreview: show, showDiarySave: show}
            });
        }
        
    }

    //SAVE METHODS
    function handleTimetableSave() {

        const data = {orgID: orgID, uuid: settings.currentLayout.uuid, layout: settings.layoutText, sessionTotal: settings.sessions, breakTotal: settings.breaks, sessionOrder: order, days: settings.days.toString(),
                     sessions: sessions};

        Axios.post('/organisation/saveLayout', data)
        .then(res => {
            if(res.data.message == 'Success') {

                setSettings(prevState => {
                    return {...prevState, yourLayouts: res.data.layouts}
                });

                setModal(prevState => {
                    return {...prevState, heading: 'Layout: ' + settings.yourLayoutText, message: 'Layout has been saved!', open: true};
                })
            }
        })
        .catch(err => {
            console.log(err);
        });
    }

    function handleDiarySave() {

        const data = {orgID: orgID, uuid: settings.currentLayout.uuid, layout: settings.layoutText, days: settings.days.toString(), startTime: settings.startTime,
                    finishTime: settings.finishTime, timeInterval: settings.timeInterval};

        Axios.post('/organisation/saveLayout', data)
        .then(res => {
            if(res.data.message == 'Success') {

                setSettings(prevState => {
                    return {...prevState, yourLayouts: res.data.layouts}
                });

                setModal(prevState => {
                    return {...prevState, heading: 'Layout: ' + settings.yourLayoutText, message: 'Layout has been saved!', open: true};
                })
            }
        })
        .catch(err => {
            console.log(err);
        });
    }
    //SAVE METHODS^^^

    //ADD LAYOUT METHODS
    function handleAddLayout() {
        setAddModal(prevState => {
            return {...prevState, open: true}
        });
    }

    function handleAddModalTextChange(event) {

        const { value } = event.target;

        setAddModal(prevState => {
            return {...prevState, newName: value}
        });
    }

    function handleAddModalSubmit() {

        const data = {orgID: orgID, name: addModal.newName};

        Axios.post('/organisation/addLayout', data)
        .then(res => {
            if(res.data.message == 'Successfully Added') {

                setSettings(prevState => {
                    return {...prevState, yourLayouts: res.data.layouts}
                });

                setAddModal(prevState => {
                    return {...prevState, newName: '', open: false}
                });
            }
        })
        .catch(err => {
            console.log(err);
        })

    }
    //ADD LAYOUT METHODS^^^

    function handleReloadTooltip() {
        ReactTooltip.rebuild();
    }

    return (
        <div>
            <table width='100%' border='1px'>
                <thead>
                    <tr>
                        <th>
                            <div className="heading-text"> <Image className="plus-image" src={settings.open ? minus : plus} onClick={openTab} /> Layouts</div><br />
                                <Collapse in={settings.open}>
                                <div>
                                <div className='margin-text-hide'>
                                    -
                                    </div>
                                <div className='normal-text'>
                                    <Row>
                                        <Col>
                                            <Row>
                                                <Col>
                                                <Row>
                                                    <div className='centred'>
                                                        Your Layouts:
                                                    </div>
                                                    <Dropdown className='side-by-side'>
                                                        <Dropdown.Toggle variant='primary'>
                                                            {settings.yourLayoutText}
                                                        </Dropdown.Toggle>
                                                        <Dropdown.Menu>
                                                            {settings.yourLayouts.map((layout, index) => {
                                                                return <Dropdown.Item key={index} onClick={() => {handlePickLayout(layout.uuid)}}>{layout.name}</Dropdown.Item>
                                                            })}
                                                        </Dropdown.Menu>
                                                    </Dropdown>
                                                    <Button variant='primary' onClick={handleAddLayout}>Add</Button>
                                                </Row>
                                                <Row>
                                                    {settings.yourLayoutText != 'Layouts' ? (
                                                        <div>
                                                            <div className='centred'>
                                                                Layouts:
                                                            </div> 
                                                            <Dropdown className='side-by-side'>
                                                                <Dropdown.Toggle variant='primary' id="dropdown-layouts">
                                                                    {settings.layoutText}
                                                                </Dropdown.Toggle>
                                                                <Dropdown.Menu>
                                                                    <Dropdown.Item onClick={handleChangeLayout}>Timetable</Dropdown.Item>
                                                                    <Dropdown.Item onClick={handleChangeLayout}>Diary</Dropdown.Item>
                                                                </Dropdown.Menu>
                                                            </Dropdown>
                                                        </div>) : null}
                                                </Row>
                                                <Row>
                                                    <div className='layout-settings'>
                                                    {settings.layoutText == 'Timetable' || settings.layoutText == 'Diary' ? (<div>
                                                        <Form>
                                                        <Form.Group>
                                                            <Form.Check className="check-side-by-side" name='0' onChange={handleChecked} type='checkbox' checked={settings.days[0]} label='Sun'/>
                                                            <Form.Check className="check-side-by-side" name='1' onChange={handleChecked} type='checkbox' checked={settings.days[1]} label='Mon'/>
                                                            <Form.Check className="check-side-by-side" name='2' onChange={handleChecked} type='checkbox' checked={settings.days[2]} label='Tue'/>
                                                            <Form.Check className="check-side-by-side" name='3' onChange={handleChecked} type='checkbox' checked={settings.days[3]} label='Wed'/>
                                                            <Form.Check className="check-side-by-side" name='4' onChange={handleChecked} type='checkbox' checked={settings.days[4]} label='Thu'/>
                                                            <Form.Check className="check-side-by-side" name='5' onChange={handleChecked} type='checkbox' checked={settings.days[5]} label='Fri'/>
                                                            <Form.Check className="check-side-by-side" name='6' onChange={handleChecked} type='checkbox' checked={settings.days[6]} label='Sat'/>
                                                        </Form.Group>
                                                        </Form></div>) : null }
                                                        
                                                    </div>
                                                </Row>
                                                <Row>
                                                    <div className='layout-settings'>
                                                        
                                                        {settings.layoutText == 'Timetable' ? (<div>
                                                            <div className='centred'>
                                                        Sessions: {settings.sessions}
                                                        </div>
                                                        <div className='side-by-side-R'>
                                                            <Button variant='primary' onClick={handlePlusSessions}>+</Button>
                                                            <Button variant='primary' onClick={handleMinusSessions}>-</Button>
                                                        </div>
                                                        </div>) : null }
                                                    </div>
                                                </Row>
                                                {settings.layoutText == 'Timetable' ? (<div>
                                                    <Row>
                                                    <div className='layout-settings'>
                                                        <Button variant='primary' onClick={handleAddBreak}>Add Break</Button>
                                                        {breakBtns.view ? <Button variant='primary' onClick={handleRemoveBreak}>Remove</Button> : null }
                                                    </div>
                                                </Row>
                                                <Row>
                                                    <div className={breakBtns.view ? 'layout-settings-move-btn-show' : 'layout-settings-move-btn-hide'}>
                                                        <Button variant='primary' onClick={handleMoveBreakUp}>Move Up</Button>
                                                        <Button variant='primary' onClick={handleMoveBreakDown}>Move Down</Button>
                                                    </div>
                                                </Row>
                                                </div>) : null }
                                                {settings.layoutText == 'Diary' ? (<div>
                                                    <Row>
                                                        <Col>
                                                        <div className='centred'>
                                                            Start Time:
                                                        </div>
                                                        </Col>
                                                        <Col>
                                                        <Dropdown className='side-by-side'>
                                                            <Dropdown.Toggle variant='primary' id="dropdown-layouts">
                                                                {settings.startTime}
                                                            </Dropdown.Toggle>
                                                            <Dropdown.Menu className='dropdown-items'>
                                                                {times.map((time, index) => {
                                                                    return <Dropdown.Item key={index} onClick={handleChangeStartTime}>{time}</Dropdown.Item>
                                                                })}
                                                            </Dropdown.Menu>
                                                        </Dropdown>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col>
                                                        <div className='centred'>
                                                            Finish Time:
                                                        </div>
                                                        </Col>
                                                        <Col>
                                                        <Dropdown className='side-by-side'>
                                                            <Dropdown.Toggle variant='primary' id="dropdown-layouts">
                                                                {settings.finishTime}
                                                            </Dropdown.Toggle>
                                                            <Dropdown.Menu className='dropdown-items'>
                                                                {times.map((time, index) => {
                                                                    return <Dropdown.Item key={index} onClick={handleChangeFinishTime}>{time}</Dropdown.Item>
                                                                })}
                                                            </Dropdown.Menu>
                                                        </Dropdown>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col>
                                                        <div className='centred'>
                                                            Interval:
                                                        </div>
                                                        </Col>
                                                        <Col>
                                                        <Dropdown className='side-by-side'>
                                                            <Dropdown.Toggle variant='primary' id="dropdown-layouts">
                                                                {settings.timeIntervalLbl}
                                                            </Dropdown.Toggle>
                                                            <Dropdown.Menu className='dropdown-items'>
                                                            <Dropdown.Item name='30' onClick={handleChangeInterval}>30 minutes</Dropdown.Item>
                                                            <Dropdown.Item name='60' onClick={handleChangeInterval}>1 hour</Dropdown.Item>
                                                            <Dropdown.Item name='90' onClick={handleChangeInterval}>1 hour, 30 minutes</Dropdown.Item>
                                                            <Dropdown.Item name='120' onClick={handleChangeInterval}>2 hours</Dropdown.Item>
                                                            </Dropdown.Menu>
                                                        </Dropdown>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                    <Col></Col><Col>
                                                        {settings.showDiarySave ? (<Button variant='primary' onClick={handleDiarySave}>Save</Button>) : null}
                                                    </Col>
                                                    
                                                    </Row>
                                                </div>) : null}
                                                </Col>
                                                <Col>
                                                    {settings.layoutText == 'Timetable' ? (<div>
                                                        Sessions:
                                                    <Row>
                                                        <Col sm={1}>
                                                        </Col>
                                                        <Col className="slot-headings">
                                                        Custom Text
                                                        </Col>
                                                        <Col className="slot-headings">
                                                        Hover Text
                                                        </Col>
                                                    </Row>
                                                    <div className='scrollable-250'>
                                                    {Object.keys(sessions).length > 0 ? (<div>
                                                        {order.map(session => {
                                                        if(session.toString().includes('b')) {
                                                            return <BreakSlot key={session} id={sessions[session].id} breakText={sessions[session].breakText} bgColor={sessions[session].bgColor} textColor={sessions[session].textColor} />
                                                        } else {
                                                            return <SessionSlot key={session} id={sessions[session].id} customText={sessions[session].customText} hoverText={sessions[session].hoverText} />
                                                        }
                                                    })}
                                                    </div>) : null}
                                                    
                                                    </div>
                                                    <div className='add-button'>
                                                        {settings.showTimetableSave ? (<Button variant='primary' onClick={handleTimetableSave}>Save</Button>) : null}
                                                    </div>
                                                    </div>) : null}
                                                </Col>
                                            </Row>
                                        </Col>
                                        <Col>
                                        {settings.layoutText == 'Timetable' || settings.layoutText == 'Diary' ? (<div>Preview:</div>) : null }
                                            <div className='scrollable-300'>
                                            {settings.showPreview ? (<table width="100%" border='1px'>
                                                    <thead>
                                                        <tr>
                                                            <td>
                                                                Session
                                                            </td>
                                                            {settings.days.map((day, index) => {
                                                                if(day) {
                                                                    return <td key={index} data-tip='day'>{days[index]}</td>
                                                                }
                                                            })}
                                                        </tr>
                                                    </thead>
                                                    {settings.layoutText == 'Timetable' && Object.keys(sessions).length > 0 ? (
                                                        <tbody>{order.map((session, index) => {
                                                        if(session.toString().includes('b')) {
                                                            return (<tr key={index} style={{backgroundColor:sessions[session].bgColor}}>
                                                                <td style={{color:sessions[session].textColor}}>
                                                                {sessions[session].breakText != '' ? sessions[session].breakText : sessions[session].id}</td>
                                                                {settings.days.map((day, index) => {
                                                                    if(day) {
                                                                        return <td key={index}></td>
                                                                    }
                                                                })}
                                                                </tr>)
                                                        } else {
                                                            return (<tr key={index}>
                                                                    <td data-tip={sessions[session].hoverText != '' ? sessions[session].hoverText : null }>
                                                                    {sessions[session].customText != '' ? sessions[session].customText : sessions[session].id}</td>
                                                                    {settings.days.map((day, index) => {
                                                                        if(day) {
                                                                            return <td key={index}></td>
                                                                        }
                                                                    })
                                                                    }
                                                                    </tr>)
                                                            }
                                                    })}
                                                    {handleReloadTooltip()}
                                                    </tbody>
                                                    ) : null}
                                                    {settings.layoutText == 'Diary' ? (
                                                        <tbody>
                                                        {settings.times.map((time, index) => {
                                                            return(<tr key={index}>
                                                                    <td>{time}</td>
                                                                    {settings.days.map((day, index) => {
                                                                        if(day) {
                                                                            return <td key={index}></td>
                                                                        }
                                                                    })
                                                                    }
                                                                  </tr>)
                                                        })}
                                                        </tbody>) : null}
                                                    
                                            </table>) : null}
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
            <ReactTooltip />
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
            <Modal show={addModal.open} onHide={handleAddModalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Layout</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Control value={addModal.newName} onChange={handleAddModalTextChange}/>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant='primary' onClick={handleAddModalSubmit}>
                        Add
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default Layouts;