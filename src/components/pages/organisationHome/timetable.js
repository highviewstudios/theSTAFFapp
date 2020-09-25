import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import { Row, Col, Button, Modal } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { UpdateRoomName, UpdateRoomID, UpdateRoomSessionID, UpdateRoomSessionLabel, UpdateRoomDate, UpdateRoomWeekBegin, UpdateRoomTotalSessions, UpdateRoomDayList, UpdateRoomWeekSystem, UpdateRoomWeekUUID, UpdateRoomLayoutData } from '../../../store/actions/globalVars';
import moment from 'moment';
import Axios from 'axios';

function Timetable(props) {


    const orgID = props.orgID;
    const organisation = useSelector(state => state.organisation);
    const globalVars = useSelector(state => state.globalVars);

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const history = useHistory();
    const dispatch = useDispatch();

    const [settings, setSettings] = useState({
        slotClass: '',
        dayClass: '',
        dates: ['', '', '', '', '', '', ''],
        weekSlot: '',
        dayIndex: 0,
        data: {},
        holiday: '',
        weekSystemUUID: ''
    });

    const [layout, setLayout] = useState({
        days: [],
        order: [],
        sessions: [],
        sessionTotal: 0
    })

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
        setup();
    }, []);


    function setup() {

        console.log(props.weekSystem);
        //SETUP NEW LAYOUT FROM REDUX
        const layoutDays = props.layoutData.days.split(',');
        const days = [];
        let newSessions = {};
        const order = props.layoutData.sessionOrder.split(',');

        for(const day of layoutDays) {
            days.push(day == 'true');
        }

        const data = {orgID: orgID, layoutUUID: props.layoutData.uuid};
        Axios.post('/organisation/getTimetableSessions', data)
        .then(res => {

            const sessions = res.data.sessions;

            for(const session of sessions) {
                newSessions[session.id] = session;
            }

            setLayout(prevState => {
                return {...prevState, days: days, sessions: newSessions, sessionTotal: props.layoutData.sessions, order: order}
            });

            /////

            let totalDays = 0;
            for(const day of days) { 
                if(day) {
                    totalDays++;
                }
            }

            console.log(totalDays);
            setSettings(prevState => {
                return {...prevState, slotClass: 'session' + totalDays + '-slot timetable-layout', dayClass: 'session' + totalDays + '-days timetable-layout'}
            });

            console.log(globalVars.weekBeginDate);
            if(globalVars.weekBeginDate == '') {
                const weekBG = FindWeekBegin(days);
                BuildDataSlots(weekBG, order, newSessions);
                CheckHoliday(weekBG);
            } else {
                FindDayIndex(days);
                const firstDate = moment(globalVars.weekBeginDate, 'DD/MM/YYYY');
                RebuildDates(firstDate, order, newSessions);
            }

        })
        .catch(err => {
            console.log(err);
        })
        //SETUP NEW LAYOUT FROM REDUX ^^^
    }

    function FindDayIndex(days) {
        let dayIndex;
        for(const [index, day] of days.entries()) {
            if(day) {
                dayIndex = index;
                break;
            }
        }

        setSettings(prevState => {
            return {...prevState, dayIndex: dayIndex}
        });
    }

    function BuildDataSlots(weekBg, order, sessions) {

        const data = {};
        const days = [];
        const weekBG = moment(weekBg, 'DD/MM/YYYY');
        const slot = {user: '', department: '', type: ''};

        const weekSlot = formatString(weekBG.week()) + '-' + weekBG.format('YY');

        for(let i = 0; i < 7; i++) {
            
            for(const sess of order) {
                days.push(formatString(weekBG.day()) + '-' + formatString(sessions[sess].id));
                const sName = formatString(weekBG.week()) + '-' + weekBG.format('YY') + '-' + formatString(weekBG.day()) + '-' + formatString(sessions[sess].id);
                data[sName] = slot;
            }

            weekBG.add(1, 'd');
        }

        const mySQLData = {orgID: orgID, room: props.roomID,week: weekSlot, days: days, weekBG: weekBg};
        Axios.post('/booking/getBookings', mySQLData)
        .then(res => {
            const recievedData = res.data;
            console.log(recievedData.bookings);
            if(recievedData.error === 'null') {
                setSettings(prevState => {
                    return {...prevState, weekSlot: weekSlot, data: recievedData.bookings}
                });     
            }
        })
        .catch(err => {
            console.log(err);
        });
    }

    function CheckHoliday(weekBG) {
        
        const date = moment(weekBG, 'DD/MM/YYYY');
        const week = formatString(date.week()) + '-' + date.format('YY');
        let holidayTitle = '';

        for(const holiday of organisation.holidays) {

            if(holiday.weeks.includes(week)) {

                if(holiday.titleUUID.includes('w')) {
                    if(props.weekSystem) {
                        holidayTitle = holiday.name;
                        setSettings(prevState => {
                            return {...prevState, weekSystemUUID: holiday.titleUUID}
                        })
                    }
                } else if(holiday.titleUUID.includes('h')){
                    holidayTitle = 'Holiday: ' + holiday.name
                }
                break;
            }
        }

        setSettings(prevState => {
            return {...prevState, holiday: holidayTitle}
        });
    }

    function formatString(time) {
        
        if(time.toString().includes('b')) {
            time = time.replace('b', '');

            if(time.toString().length == 1) {
                return 'b0' + time;
            } else {
                return time;
            }
        } else {
            if(time.toString().length == 1) {
                return '0' + time;
            } else {
                return time;
            }
        }
    }

    function handleReloadTooltip() {
        ReactTooltip.rebuild();
    }

    function handleBookClick(event) {
        
        const { id } = event.target;
        const IDs = id.toString().split('-');
        dispatch(UpdateRoomName(props.roomName));
        dispatch(UpdateRoomID(props.roomID));
        dispatch(UpdateRoomSessionID(id));
        dispatch(UpdateRoomWeekSystem(props.weekSystem));
        dispatch(UpdateRoomWeekUUID(settings.weekSystemUUID));
        dispatch(UpdateRoomLayoutData(props.layoutData));

        if(layout.sessions[IDs[1]].id.includes('b')) {
            
            dispatch(UpdateRoomSessionLabel(layout.sessions[IDs[1]].breakText));
        } else {
            if(layout.sessions[IDs[1]].customText != '') {
                dispatch(UpdateRoomSessionLabel(layout.sessions[IDs[1]].customText));
            } else {
                dispatch(UpdateRoomSessionLabel(layout.sessions[IDs[1]].id));
            }
        }
        dispatch(UpdateRoomWeekBegin(settings.dates[0]));
        dispatch(UpdateRoomDate(settings.dates[IDs[0]]));
        dispatch(UpdateRoomTotalSessions(layout.sessionTotal));
        dispatch(UpdateRoomDayList(layout.days));

        history.push('/org/' + orgID + '/book')
    }

    function FindWeekBegin(days) {

        let today = moment();
        today.startOf('week');
        
        let dates = [];
        for(let i = 0; i < 7; i++) {
            dates.push(today.format('DD/MM/YYYY'));
            today.add(1, 'd');
        }

        setSettings(prevState => {
            return {...prevState, dates: dates}
        });

        let dayIndex;
        for(const [index, day] of days.entries()) {
            if(day) {
                dayIndex = index;
                break;
            }
        }

        setSettings(prevState => {
            return {...prevState, dayIndex: dayIndex}
        });

        return dates[0];
    }

    function RebuildDates(firstDate, order, sessions) {

        let dates = [];
        for(let i = 0; i < 7; i++) {
            dates.push(firstDate.format('DD/MM/YYYY'));
            firstDate.add(1, 'd');
        }
        
        setSettings(prevState => {
            return {...prevState, dates: dates}
        });

        BuildDataSlots(dates[0], order, sessions);
        CheckHoliday(dates[0]);
    }

    function handleAdvancedWeek() {
        
        let newDate = moment(settings.dates[0], 'DD/MM/YYYY');
        newDate.add(1, 'w');

        RebuildDates(newDate, layout.order, layout.sessions);
    }

    function handleGoBackWeek() {
        
        let newDate = moment(settings.dates[0], 'DD/MM/YYYY');
        newDate.subtract(1, 'w');

        let thisWeek = moment();
        thisWeek.startOf('week');

        if(newDate < thisWeek) {
            setModal({heading: props.roomName, message: 'You cannot go back previous from this week', open: true});
        } else {

            RebuildDates(newDate, layout.order, layout.sessions);
        }
    }

    function GetDepartment(id) {

        for(const department of organisation.departments) {
            if(department.uuid == id) {
                return department.name;
            }
        }

    }

    return (
        <div>
        <Row>
            <Col><strong>
                <div className='centred'>Week Beginning: {settings.dates[settings.dayIndex]}</div>
                </strong>
            </Col>
            <Col>
                <strong>
                    <div className='centred-100'>{settings.holiday}</div>
                </strong>
            </Col>
            <Col>
                <div className='side-by-side-R'>
                    <Button variant='primary' onClick={handleGoBackWeek}>-</Button>
                    <Button variant='primary' onClick={handleAdvancedWeek}>+</Button>
                </div>
            </Col>
        </Row>
        <Row>
            <table className='timetable-layout' width='100%' border='1px'>
            <thead>
                <tr>
                    <td className={settings.slotClass}>
                        Session
                    </td>
                    {layout.days.map((day, index) => {
                        if(day) {
                            return <td className={settings.dayClass} key={index} >{dayNames[index]} <br /> {settings.dates[index]}</td>
                        }
                    })}
                </tr>
            </thead>
            <tbody>{layout.order.map((session, index) => {
                if(session.toString().includes('b')) { //breaks \/\/
                    return (<tr key={index} style={{backgroundColor:layout.sessions[session].bgColor}}>
                        <td className={settings.slotClass} style={{color:layout.sessions[session].textColor}}>
                        {layout.sessions[session].breakText != '' ? layout.sessions[session].breakText : layout.sessions[session].id}</td>
                        {layout.days.map((day, index) => {
                            if(day) {
                                if(Object.keys(settings.data).length > 0) {

                                        const name = settings.weekSlot + '-' + formatString(index) + '-' + formatString(layout.sessions[session].id);
                                        if(settings.data[name].type == 'single') {
                                            return <td className=' timetable-layout singleSlot' key={index} id={index + '-' + layout.session} onClick={handleBookClick}>
                                                {settings.data[name].user} <br/> {GetDepartment(settings.data[name].department)}
                                            </td> 
                                        } else if (settings.data[name].type == 'repeat') {
                                            return <td className=' timetable-layout repeatSlot' key={index} id={index + '-' + session} onClick={handleBookClick}>
                                                {settings.data[name].user} <br/> {GetDepartment(settings.data[name].department)}
                                            </td>
                                        } else {
                                            return <td className={organisation.locked ? 'timetable-layout emptySlotDisabled' : 'timetable-layout emptySlot'} key={index} id={index + '-' + session} onClick={handleBookClick}>Book</td> 
                                        }
                                    } else {
                                        return <td className={organisation.locked ? 'timetable-layout emptySlotDisabled' : 'timetable-layout emptySlot'} key={index} id={index + '-' + session} onClick={handleBookClick}>Book</td> 
                                    }
                            }
                        })}
                        </tr>)
                } else { //sessions \/\/
                    return (<tr key={index}>
                            <td className={settings.slotClass} data-tip={layout.sessions[session].hoverText != '' ? layout.sessions[session].hoverText : null }>
                            {layout.sessions[session].customText != '' ? layout.sessions[session].customText : layout.sessions[session].id}</td>
                            {layout.days.map((day, index) => {
                                if(day) {
                                    if(Object.keys(settings.data).length > 0) {

                                        const name = settings.weekSlot + '-' + formatString(index) + '-' + formatString(layout.sessions[session].id);
                                        if(settings.data[name].type == 'single') {
                                            return <td className=' timetable-layout singleSlot' key={index} id={index + '-' + session} onClick={handleBookClick}>
                                                {settings.data[name].user} <br/> {GetDepartment(settings.data[name].department)}
                                            </td> 
                                        } else if (settings.data[name].type == 'repeat') {
                                            return <td className=' timetable-layout repeatSlot' key={index} id={index + '-' + session} onClick={handleBookClick}>
                                                {settings.data[name].user} <br/> {GetDepartment(settings.data[name].department)}
                                            </td>
                                        } else {
                                            return <td className={organisation.locked ? 'timetable-layout emptySlotDisabled' : 'timetable-layout emptySlot'} key={index} id={index + '-' + session} onClick={handleBookClick}>Book</td> 
                                        }
                                    } else {
                                        return <td className={organisation.locked ? 'timetable-layout emptySlotDisabled' : 'timetable-layout emptySlot'} key={index} id={index + '-' + session} onClick={handleBookClick}>Book</td> 
                                    }
                                    
                                }
                            })
                            }
                            </tr>)
                    }
            })}
            {handleReloadTooltip()}
            </tbody>
            </table>
            <ReactTooltip />
            </Row>

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

export default Timetable;