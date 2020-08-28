import React, { useState, useContext } from 'react';
import ReactTooltip from 'react-tooltip';
import plus from '../../public/images/plus.png';
import minus from '../../public/images/minus.png';
import {Image, Collapse, Row, Col, Dropdown, Form, Button, Modal} from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import {layoutsUpdateDiaryDays, layoutsUpdateStartTime, layoutsUpdateFinishTime, layoutsUpdateTimeInterval, layoutsUpdateTimetableDays, layoutsUpdateSessionTotal, layoutsUpdateBreakTotal, layoutsUpdateSessionOrder, layoutsUpdateSessions} from '../../store/actions/layouts';
import { SessionsContext } from '../../context/adminTemplatesSessions';

import SessionSlot from './sessionSlot';
import BreakSlot from './breakSlot';
import Axios from 'axios';
import moment from 'moment';

function Layouts(props) {

     const orgID = props.orgID;
     const layouts = useSelector(state => state.layouts);
     const dispatch = useDispatch();
     
     const { sessions, order, breakBtns, addSession, minusSession, resetSessions, addBreak, orderMoveUp, orderMoveDown, removeBreak, SetSessions, SetOrder } = useContext(SessionsContext);

     const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

     const times = ['00:00', '00:30', '01:00', '01:30', '02:00', '02:30', '03:00', '03:30', '04:00', '04:30', '05:00', '05:30', '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', 
                    '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
                    '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'];

    const [settings, setSettings] = useState({
        open: false,
        layout: 'layout',
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
        showDiarySave: false
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
    });
    }

    function openTab() {

        if(!settings.open) {
            console.log(sessions)
            if(layouts.timetableDays.length > 0) {
                
                SetSessions(layouts.sessions);
                SetOrder(layouts.sessionOrder);

                setSettings(prevState => {
                    return {...prevState, open: true, sessions: layouts.sessionTotal, breaks: layouts.breakTotal}
                });

            } else {
                setSettings(prevState => {
                    return {...prevState, open: true, sessions: 1}
                });

                addSession(settings.sessions);
            }

            if(layouts.diaryDays.length > 0) {

                setSettings(prevState => {
                    return {...prevState, startTime: layouts.startTime, finishTime: layouts.finishTime, timeInterval: layouts.timeInterval}
                });
                findIntervalText(layouts.timeInterval);
            }

        } else {
            setSettings(prevState => {
                return {...prevState, open: false}
            });
            resetSessions();

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

    function handleChangeLayout(event) {

        const { innerText } = event.target;

        let days = [false, false, false, false, false, false, false];

        let showTimetableSave = false;
        let showDiarySave = false;

        if(innerText == "Timetable") {
             if(layouts.timetableDays.length > 0){
                days = layouts.timetableDays;
                showTimetableSave = true;
             }
        } else if(innerText == 'Diary') {
            if(layouts.diaryDays.length > 0){
                days = layouts.diaryDays;
                showDiarySave = true;
                BuildTimes(layouts.startTime, layouts.finishTime, layouts.timeInterval);
            }
        }

        let show = false;
        for(const day of days) {
            if(day == true) {
                show = true;
            }
        }

        setSettings(preState => {
            return {...preState, layout: innerText, days: days, showDiarySave: showDiarySave, showTimetableSave: showTimetableSave, showPreview: show};
        });

    }

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

        if(settings.layout == 'Diary' && settings.startTime !== 'Start Time' && settings.finishTime !== 'Finish Time' && settings.timeInterval !== 0) {
            setSettings(prevState => {
                return {...prevState, days: temp, showPreview: show, showDiarySave: show}
            });
        }
        
    }

    function handleTimetableSave() {

        const data = {orgID: orgID, layout: settings.layout, sessionTotal: settings.sessions, breakTotal: settings.breaks, sessionOrder: order, days: settings.days.toString(),
                     sessions: sessions};

        Axios.post('/organisation/addLayout', data)
        .then(res => {
            if(res.data.message == 'Success') {

                dispatch(layoutsUpdateTimetableDays(settings.days));
                dispatch(layoutsUpdateSessionTotal(settings.sessions));
                dispatch(layoutsUpdateBreakTotal(settings.breaks));
                dispatch(layoutsUpdateSessionOrder(order));
                dispatch(layoutsUpdateSessions(sessions));

                setModal(prevState => {
                    return {...prevState, heading: 'Layout: Timetable', message: 'Layout has been saved!', open: true};
                })
            }
        })
        .catch(err => {
            console.log(err);
        });
    }

    function handleDiarySave() {

        const data = {orgID: orgID, layout: settings.layout, days: settings.days.toString(), startTime: settings.startTime,
                    finishTime: settings.finishTime, timeInterval: settings.timeInterval};

        Axios.post('/organisation/addLayout', data)
        .then(res => {
            if(res.data.message == 'Success') {

                dispatch(layoutsUpdateDiaryDays(settings.days));
                dispatch(layoutsUpdateStartTime(settings.startTime));
                dispatch(layoutsUpdateFinishTime(settings.finishTime));
                dispatch(layoutsUpdateTimeInterval(settings.timeInterval));

                setModal(prevState => {
                    return {...prevState, heading: 'Layout: Diary', message: 'Layout has been saved!', open: true};
                })
            }
        })
        .catch(err => {
            console.log(err);
        });
        
    }

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
                                <div className='normal-text'>
                                    <Row>
                                        <Col>
                                            <Row>
                                                <Col>
                                                <Row>
                                                    <div className='centred'>
                                                    Layouts:
                                                    </div> 
                                                        <Dropdown className='side-by-side'>
                                                            <Dropdown.Toggle variant='primary' id="dropdown-layouts">
                                                                {settings.layout}
                                                            </Dropdown.Toggle>
                                                            <Dropdown.Menu>
                                                                <Dropdown.Item onClick={handleChangeLayout}>Timetable</Dropdown.Item>
                                                                <Dropdown.Item onClick={handleChangeLayout}>Diary</Dropdown.Item>
                                                            </Dropdown.Menu>
                                                        </Dropdown>
                                                </Row>
                                                <Row>
                                                    <div className='layout-settings'>
                                                    {settings.layout == 'Timetable' || settings.layout == 'Diary' ? (<div>
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
                                                        
                                                        {settings.layout == 'Timetable' ? (<div>
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
                                                {settings.layout == 'Timetable' ? (<div>
                                                    <Row>
                                                    <div className='layout-settings'>
                                                        <Button variant='primary' onClick={handleAddBreak}>Add Break</Button>
                                                        {breakBtns.view ? <Button variant='primary' onClick={handleRemoveBreak}>Remove</Button> : null }
                                                    </div>
                                                </Row>
                                                <Row>
                                                    {breakBtns.view ? (<div className='layout-settings'>
                                                        <Button variant='primary' onClick={handleMoveBreakUp}>Move Up</Button>
                                                        <Button variant='primary' onClick={handleMoveBreakDown}>Move Down</Button>
                                                        </div>) : null }
                                                </Row>
                                                </div>) : null }
                                                {settings.layout == 'Diary' ? (<div>
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
                                                    {settings.layout == 'Timetable' ? (<div>
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
                                                    {order.map(session => {
                                                        if(session.toString().includes('b')) {
                                                            return <BreakSlot key={session} id={sessions[session].id} breakText={sessions[session].breakText} bgColor={sessions[session].bgColor} textColor={sessions[session].textColor} />
                                                        } else {
                                                            return <SessionSlot key={session} id={sessions[session].id} customText={sessions[session].customText} hoverText={sessions[session].hoverText} />
                                                        }
                                                    })}
                                                    </div>
                                                    <div className='add-button'>
                                                        {settings.showTimetableSave ? (<Button variant='primary' onClick={handleTimetableSave}>Save</Button>) : null}
                                                    </div>
                                                    </div>) : null}
                                                </Col>
                                            </Row>
                                        </Col>
                                        <Col>
                                        {settings.layout == 'Timetable' || settings.layout == 'Diary' ? (<div>Preview:</div>) : null }
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
                                                    {settings.layout == 'Timetable' ? (
                                                        <tbody>{order.map((session, index) => {
                                                        if(session.toString().includes('b')) {
                                                            return (<tr key={index} style={{backgroundColor:sessions[session].bgColor}}>
                                                                <td style={{color:sessions[session].textColor}}>
                                                                {sessions[session].breakText != '' ? sessions[session].breakText : sessions[session].id}</td>
                                                                {settings.days.map(day => {
                                                                    if(day) {
                                                                        return <td></td>
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
                                                    {settings.layout == 'Diary' ? (
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
        </div>
    )
}

export default Layouts;