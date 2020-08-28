import React, {useState, useEffect} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, Modal, Button} from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import moment from 'moment';
import Axios from 'axios';
import { UpdateRoomName, UpdateRoomID, UpdateRoomSessionID, UpdateRoomSessionLabel, UpdateRoomDate, UpdateRoomWeekBegin, UpdateRoomTotalSessions, UpdateRoomDayList, UpdateRoomLayout } from '../../../store/actions/globalVars';

function Dairy(props) {

    const orgID = props.orgID;
    const orgLayouts = useSelector(state => state.layouts);
    const organisation = useSelector(state => state.organisation);
    const globalVars = useSelector(state => state.globalVars);

    const days = orgLayouts.timetableDays; 
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dispatch = useDispatch();

    const times = ['00:00', '00:30', '01:00', '01:30', '02:00', '02:30', '03:00', '03:30', '04:00', '04:30', '05:00', '05:30', '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', 
                    '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
                    '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'];
    const history = useHistory();

    const [settings, setSettings] = useState({
        slotClass: '',
        dayClass: '',
        times: [],
        startTime: '',
        finishTime: '',
        interval: '',
        dates: ['', '', '', '', '', '', ''],
        dayIndex: 0,
        weekSlot: '',
        data: {}
    });

    useEffect(() => {
        setup();
    }, []);

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


    function setup() {

        let totalDays = 0;
        for(const day of days) {
            if(day) {
                totalDays++;
            }
        }

        setSettings(prevState => {
            return {...prevState, slotClass: 'session' + totalDays + '-slot timetable-layout', dayClass: 'session' + totalDays + '-days timetable-layout', startTime: orgLayouts.startTime, 
                    finishTime: orgLayouts.finishTime, interval: orgLayouts.timeInterval}
        });

        const times = BuildTimes(orgLayouts.startTime, orgLayouts.finishTime, orgLayouts.timeInterval);

        if(globalVars.weekBeginDate == '') {
            const weekBG = FindWeekBegin();
            BuildDataSlots(weekBG, times);
        } else {
            const firstDate = moment(globalVars.weekBeginDate, 'DD/MM/YYYY');
            RebuildDates(firstDate, times);
        }
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
            return {...prevState, weekbegin: dates[0], dayIndex: dayIndex}
        });

        return dates[0];
    }

    function BuildDataSlots(weekBg, times) {

        const data = {};
        const days = [];
        const weekBG = moment(weekBg, 'DD/MM/YYYY');
        const slot = {user: '', department: '', type: ''};

        const weekSlot = formatString(weekBG.week()) + '-' + weekBG.format('YY');

        for(let i = 0; i < 7; i++) {

            for(const time of times) {

                days.push(formatString(weekBG.day()) + '-' + time.replace(":", ''));
                const sName = formatString(weekBG.week()) + '-' + weekBG.format('YY') + '-' + formatString(weekBG.day()) + '-' + time.replace(":", '');
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

    function BuildTimes(sTime, fTime, interval) {

        const ti = [];
        if(sTime !== 'Start Time' && fTime !== 'Finish Time' && interval !== 0) {
            
            const start = moment(sTime, "HH:mm");
            const finish = moment(fTime, "HH:mm");

                ti.push(start.format("HH:mm"));
                start.add(interval, 'm');
            }

            setSettings(prevState => {
                return {...prevState, times: ti}
            });
        }
        
        return ti;
    }

    function RebuildDates(firstDate, times) {

        let dates = [];
        for(let i = 0; i < 7; i++) {
            dates.push(firstDate.format('DD/MM/YYYY'));
            firstDate.add(1, 'd');
        }
        
        setSettings(prevState => {
            return {...prevState, dates: dates}
        });

        BuildDataSlots(dates[0], times);
    }

    function handleAdvancedWeek() {

        let newDate = moment(settings.dates[0], 'DD/MM/YYYY');
        newDate.add(1, 'w');

        RebuildDates(newDate, settings.times);
    }

    function handleGoBackWeek() {

        let newDate = moment(settings.dates[0], 'DD/MM/YYYY');
        newDate.subtract(1, 'w');

        let thisWeek = moment();
        thisWeek.startOf('week');

        if(newDate < thisWeek) {
            setModal({heading: props.roomName, message: 'You cannot go back previous from this week', open: true});
        } else {

            RebuildDates(newDate, settings.times);
        }
    }

    function handleBookClick(event) {
        
        const { id } = event.target;
        console.log(id);
        const IDs = id.toString().split('-');
        dispatch(UpdateRoomName(props.roomName));
        dispatch(UpdateRoomID(props.roomID));
        dispatch(UpdateRoomSessionID(id));
        dispatch(UpdateRoomLayout('diary'));
        dispatch(UpdateRoomSessionLabel(IDs[1]))
        dispatch(UpdateRoomWeekBegin(settings.dates[0]));
        dispatch(UpdateRoomDate(settings.dates[IDs[0]]));
        //dispatch(UpdateRoomTotalSessions(sessionTotal));
        dispatch(UpdateRoomDayList(days));

        history.push('/org/' + orgID + '/book');
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
                <div className='centred'>Week Beginning: {settings.dates[0]}</div>
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
            <tbody>
                {settings.times.map((time, index) => {
                    return(<tr key={index}>
                            <td className={settings.slotClass}>{time}</td>
                            {days.map((day, index) => {
                                if(day) {
                                    if(Object.keys(settings.data).length > 0) {
                                        const name = settings.weekSlot + '-' + formatString(index) + '-' + time.replace(':', '');
                                        if(settings.data[name].type == 'single') {
                                            return <td className=' timetable-layout singleSlot' key={index} id={index + '-' + time} onClick={handleBookClick}>
                                                {settings.data[name].user} <br/> {GetDepartment(settings.data[name].department)}
                                            </td> 
                                        } else if (settings.data[name].type == 'repeat') {
                                            return <td className=' timetable-layout repeatSlot' key={index} id={index + '-' + time} onClick={handleBookClick}>
                                                {settings.data[name].user} <br/> {GetDepartment(settings.data[name].department)}
                                            </td>
                                        } else {
                                            return <td className=' timetable-layout emptySlot' key={index} id={index + '-' + time} onClick={handleBookClick}>Book</td> 
                                        }
                                    } else {
                                        return <td className='timetable-layout emptySlot' key={index} id={index + '-' + time} onClick={handleBookClick}>Book</td>
                                    }
                                }
                            })
                            }
                            </tr>)
                })}
                </tbody>
            </table>
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

export default Dairy

