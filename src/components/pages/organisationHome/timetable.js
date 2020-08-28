import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import { Row, Col, Button, Modal } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { UpdateRoomName, UpdateRoomID, UpdateRoomSessionID, UpdateRoomSessionLabel, UpdateRoomDate, UpdateRoomWeekBegin, UpdateRoomTotalSessions, UpdateRoomDayList, UpdateRoomLayout } from '../../../store/actions/globalVars';
import moment from 'moment';
import Axios from 'axios';

function Timetable(props) {


    const orgID = props.orgID;
    const orgLayouts = useSelector(state => state.layouts);
    const organisation = useSelector(state => state.organisation);
    const globalVars = useSelector(state => state.globalVars);

    const days = orgLayouts.timetableDays; 
    const order = orgLayouts.sessionOrder;
    const sessions = orgLayouts.sessions;
    const sessionTotal = orgLayouts.sessionTotal;
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const history = useHistory();
    const dispatch = useDispatch();

    const [settings, setSettings] = useState({
        slotClass: '',
        dayClass: '',
        dates: ['', '', '', '', '', '', ''],
        weekSlot: '',
        dayIndex: 0,
        data: {}
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
        setup();
    }, []);


    function setup() {

        let totalDays = 0;
        for(const day of days) {
            if(day) {
                totalDays++;
            }
        }
        setSettings(prevState => {
            return {...prevState, slotClass: 'session' + totalDays + '-slot timetable-layout', dayClass: 'session' + totalDays + '-days timetable-layout'}
        });

        if(globalVars.weekBeginDate == '') {
            const weekBG = FindWeekBegin();
            BuildDataSlots(weekBG);
        } else {
            const firstDate = moment(globalVars.weekBeginDate, 'DD/MM/YYYY');
            RebuildDates(firstDate);
        }
    }

    function BuildDataSlots(weekBg) {

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

        const mySQLData = {orgID: orgID, room: props.roomID,week: weekSlot, days: days};
        Axios.post('/booking/getBookings', mySQLData)
        .then(res => {
            const recievedData = res.data;
            if(recievedData.error === 'null') {
                setSettings(prevState => {
                    return {...prevState, weekSlot: weekSlot, data: recievedData.bookings}
                });     
            }
        })
        .catch(err => {
            console.log(err);
        });

        //console.log(data);

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
        console.log(id);
        const IDs = id.toString().split('-');
        dispatch(UpdateRoomName(props.roomName));
        dispatch(UpdateRoomID(props.roomID));
        dispatch(UpdateRoomSessionID(id));
        dispatch(UpdateRoomLayout('timetable'));

        if(sessions[IDs[1]].id.includes('b')) {
            
            dispatch(UpdateRoomSessionLabel(sessions[IDs[1]].breakText));
        } else {
            if(sessions[IDs[1]].customText != '') {
                dispatch(UpdateRoomSessionLabel(sessions[IDs[1]].customText));
            } else {
                dispatch(UpdateRoomSessionLabel(sessions[IDs[1]].id));
            }
        }
        dispatch(UpdateRoomWeekBegin(settings.dates[0]));
        dispatch(UpdateRoomDate(settings.dates[IDs[0]]));
        dispatch(UpdateRoomTotalSessions(sessionTotal));
        dispatch(UpdateRoomDayList(days));

        history.push('/org/' + orgID + '/book')
    }

    function FindWeekBegin() {

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

    function RebuildDates(firstDate) {

        let dates = [];
        for(let i = 0; i < 7; i++) {
            dates.push(firstDate.format('DD/MM/YYYY'));
            firstDate.add(1, 'd');
        }
        
        setSettings(prevState => {
            return {...prevState, dates: dates}
        });

        BuildDataSlots(dates[0]);
    }

    function handleAdvancedWeek() {
        
        let newDate = moment(settings.dates[0], 'DD/MM/YYYY');
        newDate.add(1, 'w');

        RebuildDates(newDate);
    }

    function handleGoBackWeek() {
        
        let newDate = moment(settings.dates[0], 'DD/MM/YYYY');
        newDate.subtract(1, 'w');

        let thisWeek = moment();
        thisWeek.startOf('week');

        if(newDate < thisWeek) {
            setModal({heading: props.roomName, message: 'You cannot go back previous from this week', open: true});
        } else {

            RebuildDates(newDate);
        }
    }

    function GetDepartment(id) {

        for(const department of organisation.departments) {
            if(department.id == id) {
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
                    {days.map((day, index) => {
                        if(day) {
                            return <td className={settings.dayClass} key={index} >{dayNames[index]} <br /> {settings.dates[index]}</td>
                        }
                    })}
                </tr>
            </thead>
            <tbody>{order.map((session, index) => {
                if(session.toString().includes('b')) { //breaks \/\/
                    return (<tr key={index} style={{backgroundColor:sessions[session].bgColor}}>
                        <td className={settings.slotClass} style={{color:sessions[session].textColor}}>
                        {sessions[session].breakText != '' ? sessions[session].breakText : sessions[session].id}</td>
                        {days.map((day, index) => {
                            if(day) {
                                if(Object.keys(settings.data).length > 0) {

                                        const name = settings.weekSlot + '-' + formatString(index) + '-' + formatString(sessions[session].id);
                                        if(settings.data[name].type == 'single') {
                                            return <td className=' timetable-layout singleSlot' key={index} id={index + '-' + session} onClick={handleBookClick}>
                                                {settings.data[name].user} <br/> {GetDepartment(settings.data[name].department)}
                                            </td> 
                                        } else if (settings.data[name].type == 'repeat') {
                                            return <td className=' timetable-layout repeatSlot' key={index} id={index + '-' + session} onClick={handleBookClick}>
                                                {settings.data[name].user} <br/> {GetDepartment(settings.data[name].department)}
                                            </td>
                                        } else {
                                            return <td className=' timetable-layout emptySlot' key={index} id={index + '-' + session} onClick={handleBookClick}>Book</td> 
                                        }
                                    } else {
                                        return <td className=' timetable-layout emptySlot' key={index} id={index + '-' + session} onClick={handleBookClick}>Book</td> 
                                    }
                            }
                        })}
                        </tr>)
                } else { //sessions \/\/
                    return (<tr key={index}>
                            <td className={settings.slotClass} data-tip={sessions[session].hoverText != '' ? sessions[session].hoverText : null }>
                            {sessions[session].customText != '' ? sessions[session].customText : sessions[session].id}</td>
                            {days.map((day, index) => {
                                if(day) {
                                    if(Object.keys(settings.data).length > 0) {

                                        const name = settings.weekSlot + '-' + formatString(index) + '-' + formatString(sessions[session].id);
                                        if(settings.data[name].type == 'single') {
                                            return <td className=' timetable-layout singleSlot' key={index} id={index + '-' + session} onClick={handleBookClick}>
                                                {settings.data[name].user} <br/> {GetDepartment(settings.data[name].department)}
                                            </td> 
                                        } else if (settings.data[name].type == 'repeat') {
                                            return <td className=' timetable-layout repeatSlot' key={index} id={index + '-' + session} onClick={handleBookClick}>
                                                {settings.data[name].user} <br/> {GetDepartment(settings.data[name].department)}
                                            </td>
                                        } else {
                                            return <td className=' timetable-layout emptySlot' key={index} id={index + '-' + session} onClick={handleBookClick}>Book</td> 
                                        }
                                    } else {
                                        return <td className=' timetable-layout emptySlot' key={index} id={index + '-' + session} onClick={handleBookClick}>Book</td> 
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