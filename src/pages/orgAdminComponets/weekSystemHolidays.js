import React, { useState, useEffect } from 'react';
import { orgUpdateHolidays, orgUpdateLocked } from '../../store/actions/organistion';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Collapse, Image, Row, Col, ListGroup, ListGroupItem, Button, Form, Modal } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import plus from '../../public/images/plus.png';
import minus from '../../public/images/minus.png';
import Axios from 'axios';

function WeekSystemHolidays(props) {

    const orgID = props.orgID;
    const dispatch = useDispatch();
    const history = useHistory();

    const [settings, setSettings] = useState({
        open: false,
        startDate: moment(),
        endDate: moment(),
        startDateValue: '',
        endDateValue: '',
        weeks: [],
        holidayTitles: [],
        addNew: false,
        newHoliday: '',
        editWeek: false,
        editWeekIndex: 0,
        editTitle: false,
        titleUUID: '',
        showWeeks: false,
        downloadedHolidays: [],
        weekSystem: false,
        weeksNum: [],
        orgLocked: false,
        collides: false
    });

    const [modal, setModal] = useState({
        open: false,
        heading: '',
        message: ''
    });

    const [modalYN, setModalYN] = useState({
        open: false,
        heading: '',
        message: '',
        acceptFunction: '',
        acceptName: '',
        showAccept: false,
        cancelName: '',
        showCancel: false
    });

    const [modalLg, setModalLg] = useState({
        open: false,
        heading: '',
        message1: '',
        message2: '',
        message3: '',
        boldMessage: ''
    });

    const [modalLock, setModalLock] = useState({
        open: false,
        heading: '',
        message1: '',
        message2: '',
        message3: '',
        boldMessage: ''
    });

    const [renameModal, setRenameModal] = useState({
        open: false,
        heading: '',
        message: '',
        renameText: '',
    });

    const [help, setHelp] = useState({
        holidayTitlesBorder: false,
        weeksBorder: false,
        datesText: '',
        dates: false,
        holidayTitlesText: '',
        holidayTitles: false,
        weeksText: '',
        weeks: false,
        weekNums: false,
        weekNumsText: ''
    });

    useEffect(() => {
        showHelp();
    },[settings.showWeeks, settings.editWeek, settings.editTitle, settings.holidayTitles])

    function handleModalClose() {
        setModal(prevState => {
            return {...prevState,
            open: false
        }
    });
    }

    function handleModalLgClose() {
        setModalLg(prevState => {
            return {...prevState,
            open: false
        }
    });
    }

    function handleModalLockClose() {
        setModalLock(prevState => {
            return {...prevState,
            open: false
        }
    });
    }

    function handleModalYNClose() {
        setModalYN(prevState => {
            return {...prevState,
            open: false
        }
    });
    }

    function handleModalLockRestore() {
        
        setModalYN({heading: 'Are you sure?', message: 'Are you sure you want to Restore?', acceptName: 'Yes', showAccept: true, acceptFunction: restoreAcceptence, cancelName: 'No', showCancel: true, open: true})
    }

    function restoreAcceptence() {

        setModalYN(prevState => {
            return {...prevState, open: false}
        });

        setModalLock(prevState => {
            return {...prevState, open: false}
        });
        
        const data = {orgID: orgID}
        Axios.post('/organisation/restore', data)
        .then(res => {
            const data = res.data;
            
            if(data.message == 'System Restored') {
                dispatch(orgUpdateLocked((data.locked == 'true')));
                dispatch(orgUpdateHolidays(data.holidays));
                setModalYN({heading: 'System Restored', message: 'Your system has been restored!', showAccept: true, acceptName: 'Ok', acceptFunction: AcceptenceOK, showCancel: false, open: true});
            }
        })
        .catch(err => {
            console.log(err);
        })
    }

    function AcceptenceOK() {

        setModalYN(prevState => {
            return {...prevState, open: false}
        });
        history.push('/org/' + orgID);

    }

    function handleModalLockUnlock() {

        setModalLock(prevState => {
            return {...prevState, open: false}
        });

        const data = {orgID: orgID}
        Axios.post('/organisation/unlock', data)
        .then(res => {
            const data = res.data;

            if(data.error == 'Yes') {
                setModalLock({open: false});
                setModal({heading: 'Error Unlocking', message: data.message, open: true});
            } else {
                if(data.message == 'System Unlocked') {
                    dispatch(orgUpdateLocked((data.locked == 'true')));
                    setModalYN({heading: 'System Unlocked', message: 'Your system has been unlocked!', showAccept: true, acceptName: 'Ok', acceptFunction: AcceptenceOK, showCancel: false, open: true});
                }
            }
        })
        .catch(err => {
            console.log(err);
        })
    }

    function showHelp() {

        let holidayTitlesBorder = false, weeksBorder = false, datesText, dates = false, holidayTitlesText, holidayTitles = false, weeksText, weeks = false, weekNums = false, weekNumsText
        if(!settings.showWeeks) {
            datesText = "Set the 'Start Date' and 'End Date' to bring up the weeks under Year Preview";
            dates = true;
            if(settings.holidayTitles.length > 0) {
                holidayTitlesText = 'Click on a holiday title to edit it.';
            } else {
                holidayTitlesText = "Add a holiday title"
            }
            holidayTitles = true;
        } else if (!settings.editWeek && !settings.editTitle && settings.showWeeks) {
            holidayTitlesText = 'Click on a holiday title to edit it.';
            holidayTitles = true;
            weeksText = 'Click on a week on the right to assign a holiday to it'
            weeks = true;
        } else if(settings.editWeek) {
            holidayTitlesText = 'Click on a title to assign it to the week';
            holidayTitles = true;
            if(settings.weekSystem) {
                weekNumsText = 'Or Click on a week to assign it to';
                weekNums = true
            }
        } else if(settings.editTitle) {
            holidayTitlesText = "Use the 'Rename' or 'Delete' buttons to the left";
            holidayTitles = true;
            weeksText = 'Click on a week on the right to assign a holiday to it'
            weeks = true;
        }

        setHelp({holidayTitlesBorder: holidayTitlesBorder, weeksBorder: weeksBorder, datesText: datesText, dates: dates, holidayTitlesText: holidayTitlesText, holidayTitles: holidayTitles, 
                    weeksText: weeksText, weeks: weeks, weekNumsText: weekNumsText, weekNums: weekNums});
        
    }

    function handleRenameModalClose() {
        setRenameModal(prevState => {
            return {...prevState,
            open: false
        }
    });
    }

    function openHolidays() {

        if(!settings.open) {

            const data = {orgID: orgID};
            Axios.post('/organisation/getHolidayData', data)
            .then(res => {
                const data = res.data;
                console.log(data);

                let startDate = moment();
                let endDate = moment();
                let startDateString = '';
                let endDateString = '';
                if(data.org.holidayStartDate == '') {
                    startDateString = '';
                } else {
                    startDate = moment(data.org.holidayStartDate, 'DD/MM/YYYY');
                    startDateString = startDate.format('DD/MM/YYYY');
                }
                if(data.org.holidayEndDate == '') {
                    endDateString = '';
                } else {
                    endDate = moment(data.org.holidayEndDate, 'DD/MM/YYYY');
                    endDateString = endDate.format('DD/MM/YYYY');
                }
                console.log(startDate);
                setSettings(prevState => {
                    return {...prevState, 
                        open: true, 
                        holidayTitles: data.titles,
                        startDate: startDate,
                        startDateValue: startDateString,
                        endDate: endDate,
                        endDateValue: endDateString,
                        weekSystem: (data.org.weekSystem == 'true'),
                        orgLocked: (data.locked == 'true'),
                        collides: data.collideBookings
                    };
                });
                const weeks = getWeeks(startDateString, endDateString);
                workDownloadedHolidays(weeks, data.holidays);
                BuildWeekNums(data.org.weeks)
            })
            .catch(err => {
                console.log(err);
            })
        } else {
            setSettings(prevState => {
                return {...prevState, open: false}
            })
        }
    }

    function handleStartDateChange(date) {
        
        setSettings(prevState => {
            return {...prevState, startDate: date, startDateValue: moment(date, 'DD/MM/YYYY').format('DD/MM/YYYY')}
        });

        getWeeks(moment(date, 'DD/MM/YYYY').format('DD/MM/YYYY'), settings.endDateValue);
    }

    function handleEndDateChange(date) {
        
        setSettings(prevState => {
            return {...prevState, endDate: date, endDateValue: moment(date, 'DD/MM/YYYY').format('DD/MM/YYYY') }
        });

        getWeeks(settings.startDateValue, moment(date, 'DD/MM/YYYY').format('DD/MM/YYYY'));
    }

    function getWeeks(startDate, endDate) {

        if(startDate != '' && endDate != '') {
            let sDate = moment(startDate, 'DD/MM/YYYY').startOf('week');
            const eDate = moment(endDate, 'DD/MM/YYYY').startOf('week');

            let weeks = [];
            while(sDate.isBefore(eDate)) {
                const week = {week: formatString(sDate.week()) + '-' +sDate.format('YY'), date: sDate.format('DD/MM/YYYY'), holiday: 0};
                weeks.push(week);
                sDate.add(1, 'w');
            }

            setSettings(prevState => {
                return {...prevState, weeks: weeks, showWeeks: true};
            });

            return weeks;
        }
    }

    function workDownloadedHolidays(weeks, holidays) {

        if(holidays.length > 0) {

            for(const holiday of holidays) {

                for(const week of weeks) {
                    if(holiday.weeks.includes(week.week)) {
                        week.holiday = holiday.titleUUID;
                    }
                }
            }

            setSettings(prevState => {
                return {...prevState, weeks: weeks};
            });
        }
    }

    function BuildWeekNums(weekNum) {

        let weeks = [];
        for(let i = 1; i <= weekNum; i++) {
            weeks.push(i);
        }

        setSettings(prevState => {
            return {...prevState, weeksNum: weeks}
        });
    }

    function formatString(time) {

        if(time.toString().length == 1) {
            return '0' + time;
        } else {
            return time;
        }
    }

    function handleWeek(id) {

        setSettings(prevState => {
            return {...prevState, editWeekIndex: id, editWeek: true, editTitle: false};
        });
    }

    function handleHolidayTitle(title, uuid) {

        if(settings.editWeek) {

            const weeks = settings.weeks;

            weeks[settings.editWeekIndex].holiday = 'h' + formatString(uuid);

            setSettings(prevState => {
                return{...prevState, weeks: weeks, editWeek: false}
            });
        } else{
            if(title != 'Normal') {
                setSettings(prevState => {
                    return{...prevState, editTitle: true, editWeek: false, titleUUID: uuid}
                });
            } else {
                setSettings(prevState => {
                    return{...prevState, editTitle: false, editWeek: false}
                });
            }
        }
    }

    function handleWeekClick(num) {

        if(settings.editWeek) {

            const weeks = settings.weeks;

            weeks[settings.editWeekIndex].holiday = 'w' + formatString(num);

            setSettings(prevState => {
                return {...prevState, weeks: weeks, editWeek: false}
            });
        }
    }

    function handleAddNew() {
        setSettings(prevState => {
            return {...prevState, addNew: true}
        });
    }

    function handleAddClose() {
        setSettings(prevState => {
            return {...prevState, addNew: false}
        });
    }

    function handleTextChange(event) {

        const {name, value } = event.target;

        setSettings(prevState => {
            return {...prevState, [name]: value}
        });
    }

    function handleRenameTextChange(event) {

        const {name, value } = event.target;

        setRenameModal(prevState => {
            return {...prevState, [name]: value}
        });
    }

    function handleAddTitle() {

        const data = {orgID: orgID, title: settings.newHoliday};
        Axios.post('/organisation/addHolidayTitle', data)
        .then(res => {
            const data = res.data;
            console.log(data);
            if(data.message == 'Successfully added') {
                setSettings(prevState => {
                    return{...prevState, holidayTitles: data.titles, addNew: false, newHoliday: ''};
                });
            }
        })
        .catch(err => {
            console.log(err);
        });
    }

    function handleSave() {
        console.log(settings.weeks);
        const holidays = {};
        for(const holiday of settings.weeks) {
            
            if(holiday.holiday != '0') {
                let week = holidays[holiday.holiday];
                if(week == '' || week == null) {
                    week = holiday.week;
                } else {
                    week += ',' + holiday.week
                }
                holidays[holiday.holiday] = week;
            }
        }

        const keys = Object.keys(holidays)
        console.log(keys);
        console.log(holidays);

        const data = {orgID: orgID, startDate: settings.startDateValue, endDate: settings.endDateValue, holidays: keys, holidayWeeks: holidays, weekSystem: settings.weekSystem.toString(), weeksNo: settings.weeksNum.length};
        Axios.post('/organisation/saveHolidays', data)
        .then(res => {
            const data = res.data;
            dispatch(orgUpdateHolidays(data.holidays));
            if(data.locked) {

                dispatch(orgUpdateLocked('true'));

                setSettings(prevState => {
                    return {...prevState, orgLocked: data.locked, collides: data.collidedBookings};
                });

                const locked = 'Some or all of your rooms have the week system enabled on them. Due to this your organisation will be locked until you double check all the bookings are where they should be.\n\n\n\n';
                const instructions = "To unlock the organisation, go on 'UNLOCK' and follow the instructions to unlock. Here you will also be able to restore the system back to how it was, by going on 'RESTORE'";
                const collide = "\n\nSome of your bookings have been collided with single bookings, as single bookings are not affected with changing the week system. Please go to 'COLLIDED BOOKINGS' to see them";

                let message = ''
                let bold = ''

                if(data.collidedBookings) {
                    message = collide;
                    bold = 'You will NOT be able to unlock your organisation until you have cleared all the collided bookings';
                }

                setModalLg({heading: 'Week System', message1: locked, message2: instructions, message3: message, boldMessage: bold, open: true});
            }
        })
        .catch(err => {
            console.log(err);
        })
    }

    function handleCollisionBookings() {
        history.push("/org/" + orgID + "/collisionBookings")
    }

    function handleUnlock() {

        const message = 'To unlock this organisation make sure that you have cleared all of the collided bookings, the system WILL NOT let you unlock until this is done. Backups only stay active for one cycle of locking organisation. Once unlocked, they are deleted and this is unreservable!!';
        const restore = "If you want to restore everything to the orginial state, before you edit the week system, click 'RESTORE'"

        setModalLock({heading: 'Unlock Organisation', message1: message, message2: restore, open: true});

    }

    function findHoliday(uuid) {

        if(uuid == 0) {
            return 'Normal'
        } else {
            let id = '';
            if(uuid.includes('h')) {
                const num = uuid.replace('h', '');
                
                if(num[0] == '0') {
                    id = num[1];
                } else {
                    id = num;
                }

                for(const title of settings.holidayTitles) {
                    if(title.uuid == id) {
                        return title.name;
                    }
                }
            }
            if(uuid.includes('w')) {
                const num = uuid.replace('w', '');
                
                if(num[0] == '0') {
                    return 'Week ' + num[1]; 
                } else {
                    return 'Week ' + num;
                }
            }
        }
    }

    function handleRename() {

        let name = ''
        for(const title of settings.holidayTitles) {
            if(title.uuid == settings.titleUUID) {
                name = title.name;
                break; 
            }
        }
        
        setRenameModal({heading: 'Rename', open: true, renameText: name})
    }

    function handleRenameSubmit() {

        const data = {orgID: orgID, uuid: settings.titleUUID, title: renameModal.renameText};
        Axios.post('/organisation/renameHolidayTile', data)
        .then(res => {
            const data = res.data;

            if(data.message == 'Successfully Updated') {
                setSettings(prevState => {
                    return {...prevState, holidayTitles: data.titles, editTitle: false};
                });
            }
        })
        .catch(err => {
            console.log(err);
        });

        setRenameModal({renameText: '', open: false});
    }

    function handleDelete() {

        const data = {orgID: orgID, uuid: settings.titleUUID}

        Axios.post('/organisation/deleteHolidayTitle', data)
        .then(res => {
            const data = res.data;

            if(data.message == 'Successfully Deleted') {
                setSettings(prevState => {
                    return {...prevState, holidayTitles: data.titles, editTitle: false};
                });
                deleteInWeeks(settings.titleUUID);

            }
        })
        .catch(err => {
            console.log(err);
        })
    }

    function deleteInWeeks(uuid) {

        const weeks = settings.weeks;
        for(const week of weeks) {
            if(week.holiday == uuid) {
                week.holiday = 0;
            }
        }

        setSettings(prevState => {
            return {...prevState, weeks: weeks}
        });
    }

    function handleWeekSystemClicked(event) {
        
        const { checked } = event.target;
        let weeksNum = [];
        if(checked) {
            
            weeksNum = ['1'];
            setSettings(prevState => {
                return{...prevState, weekSystem: checked, weeksNum: weeksNum}
            });
            MarkNormalAsWeek();
        } else {
            const data = {orgID: orgID};
            Axios.post('/organisation/geRoomsWeekSystem', data)
            .then(res => {
                if(res.data.rooms) {
                    setModal({heading: 'Week System', message: 'There are some rooms still using the week system, delete them first', open: true});
                } else {
                    setSettings(prevState => {
                        return {...prevState, weekSystem: checked, weeksNum: weeksNum}
                    });
                    MarkWeekAsNormal();
                }
            })
            .catch(err => {
                console.log(err);
            })
        }
    }

    function MarkNormalAsWeek() {
        
        let weeks = settings.weeks;
        for(const week of weeks) {
            if(week.holiday == '0') {
                week.holiday = 'w01';
            }
        }

        setSettings(prevState => {
            return {...prevState, weeks: weeks}
        })
    }
    
    function MarkWeekAsNormal() {

        let weeks = settings.weeks;
        for(const week of weeks) {
            if(week.holiday.includes('w')) {
                week.holiday = '0';
            }
        }

        setSettings(prevState => {
            return {...prevState, weeks: weeks}
        })
    }

    function handleWeekSystemPlus() {

        const weeksNum = settings.weeksNum;

        let len = weeksNum.length + 1;
        if(len == 100) {
            setModal(prevState => {
                return {...prevState, heading: 'Weeks', message: 'You cannot exceed 99 weeks', open: true}
            });
        } else {
            weeksNum.push(len);

            setSettings(prevState => {
                return {...prevState, weeksNum: weeksNum}
            });
        }
    }

    function handleWeekSystemMinus() {

        const weeksNum = settings.weeksNum;
        if(weeksNum.length > 1) {
            const weekNo = weeksNum.pop();
            const newWeek = weekNo - 1;

            let weeks = settings.weeks;
            for(const week of weeks) {
                if(week.holiday == 'w' + formatString(weekNo)) {
                    week.holiday = 'w' + formatString(newWeek);
                }
            }
            setSettings(prevState => {
                return {...prevState, weeksNum: weeksNum, weeks: weeks}
            });
        }
    }

    return (<div>

        <table width='100%' border='1px'>
            <thead>
                <tr>
                    <th>
                    <div className="heading-text"> <Image className="plus-image" src={settings.open ? minus : plus} onClick={openHolidays} /> Week System / Holidays</div><br />
                    <Collapse in={settings.open}>
                        <div>
                        <div className='margin-text'>
                            {help.dates ? (
                                <div>{help.datesText}</div>
                            ) : null}
                            {help.dates && help.holidayTitles ? '---' : null}
                            {help.holidayTitles ? (
                                <div className='help-holidayTitles'>{help.holidayTitlesText}</div>
                                ) : null}
                            {help.holidayTitles && help.weeks || help.holidayTitles && help.weekNums ? '---' : null}
                            {help.weeks ? (
                                <div className='help-weeks'>{help.weeksText}</div>
                            ) : null}
                            {help.weekNums ? (
                                <div className='help-weekNums'>{help.weekNumsText}</div>
                            ) : null}
                        </div>
                        <div className='normal-text'>
                            <Row>
                                <Col>
                                    <Row>
                                        <Col>
                                        <Row>
                                        <Col>Start Date:</Col>
                                        <Col><DatePicker dateFormat='dd/MM/yyyy' selected={new Date(settings.startDate)} value={settings.startDateValue} onChange={handleStartDateChange}/></Col>
                                        </Row>
                                        <Row className='holidays-datePadding'>
                                        <Col>End Date:</Col>
                                        <Col><DatePicker dateFormat='dd/MM/yyyy' selected={new Date(settings.endDate)} value={settings.endDateValue} onChange={handleEndDateChange}/></Col>
                                        </Row>
                                        <Row className='holidays-datePadding'>
                                            {!settings.editWeek ? (<div>
                                                {settings.addNew ? (<div className='holidays-addNew'>
                                                    <Form.Group>
                                                    <Form.Label>New Holiday:</Form.Label>
                                                    <Form.Control name="newHoliday" value={settings.newHoliday} onChange={handleTextChange}></Form.Control>
                                                    </Form.Group>
                                                    <Button variant='primary' onClick={handleAddTitle}>Add</Button>
                                                    <Button variant='primary' onClick={handleAddClose}>Close</Button>
                                                </div>) : (<div>
                                                            <Button  className='side-by-side' variant='primary' onClick={handleAddNew}>Add New Holiday Title</Button>
                                                            <div className={settings.editTitle ? null : 'weeks-holidays-hide'}>
                                                                <Button className='side-by-side' variant='primary' onClick={handleRename}>Rename</Button>
                                                                <Button className='side-by-side' variant='primary' onClick={handleDelete}>Delete</Button>
                                                            </div>
                                                            </div>)}
                                                </div>) : null}
                                        </Row>
                                        <Row>
                                            {!settings.editWeek ? (<div>
                                                <div className='weekSystem-centred'>
                                                <Form.Check type='checkbox' checked={settings.weekSystem} onChange={handleWeekSystemClicked} label='Use week system' />
                                                </div>
                                                {settings.weekSystem ? (<div className='weekSystem-centred'>
                                                    Weeks: {settings.weeksNum.length}<br />
                                                    <Button variant='primary' onClick={handleWeekSystemMinus}>-</Button>
                                                    <Button variant='primary' onClick={handleWeekSystemPlus}>+</Button>
                                                </div>) : null}
                                            </div>) : null}
                                        </Row>
                                        </Col>
                                        <Col>
                                        <Row>
                                            Holiday Titles:
                                            <div className={help.holidayTitles ? 'help-holidaytiles-bordered scrollable-150 holidays-titles' : 'scrollable-200 holidays-titles'}>                            
                                                <ListGroup>
                                                {!settings.weekSystem ? <ListGroupItem action onClick={() => handleHolidayTitle('Normal', 0)}>Normal</ListGroupItem> : null}
                                                {settings.holidayTitles.map((title, index) => {
                                                    return <ListGroupItem key={index} action onClick={() => handleHolidayTitle(title.name, title.uuid)}>{title.name}</ListGroupItem>
                                                })}
                                                </ListGroup>
                                            </div>
                                        </Row>
                                        <Row className='weeks-row-padding'>
                                            <div className={settings.weekSystem ? 'weekSystem-weeks scrollable-150' : 'weeks-holidays-hide'}>
                                                Weeks: 
                                                <div className={help.weekNums ? 'help-weekNums-bordered' : null}>                        
                                                    <ListGroup>
                                                    {settings.weeksNum.map((week, index) => {
                                                        return <ListGroupItem key={index} action onClick={() => {handleWeekClick(week)}}>Week{week}</ListGroupItem>
                                                    })}
                                                    </ListGroup>
                                                </div>
                                            </div>
                                        </Row>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col>
                                    Year Preview:
                                    <div className={help.weeks ? 'help-weeks-bordered scrollable-300' : 'scrollable-300'}>
                                        <ListGroup>
                                            {settings.weeks.map((week, index) => {
                                                return <ListGroupItem href={'#' + index} key={index} action onClick={() => handleWeek(index)}>{week.date} - {findHoliday(week.holiday)}</ListGroupItem>
                                            })}
                                        </ListGroup>
                                    </div>
                                    <div className={settings.showWeeks ? "save-button-show" : "save-button-hidden"}>
                                            {settings.orgLocked ? (<div>
                                                {settings.collides ? <Button onClick={handleCollisionBookings}>Collided Bookings</Button> : null}
                                                <Button onClick={handleUnlock}>Unlock</Button>
                                            </div>) :(<Button onClick={handleSave}>Save</Button>)}
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
        <Modal show={modalYN.open} onHide={handleModalYNClose}>
            <Modal.Header closeButton>
            <Modal.Title>{modalYN.heading}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{modalYN.message}</Modal.Body>
            <Modal.Footer>
            {modalYN.showAccept ? (<div>
                <Button variant="primary" onClick={modalYN.acceptFunction}>
                    {modalYN.acceptName}
                </Button>
            </div>) : null}
            {modalYN.showCancel ? (<div>
                <Button variant="primary" onClick={handleModalYNClose}>
                    {modalYN.cancelName}
                </Button>
            </div>) : null}
            </Modal.Footer>
        </Modal>
            <Modal size='lg' show={modalLg.open} onHide={handleModalLgClose}>
                <Modal.Header closeButton>
                <Modal.Title>{modalLg.heading}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {modalLg.message1 != '' ? modalLg.message1 : null}
                    {modalLg.message2 != '' ? (<div><br />{modalLg.message2}</div>) : null}
                    {modalLg.message3 != '' ? (<div><br />{modalLg.message3}</div>) : null}
                    {modalLg.boldMessage != '' ? (<div><br /><strong>{modalLg.boldMessage}</strong></div>) : null}
                </Modal.Body>
                <Modal.Footer>
                <Button variant="primary" onClick={handleModalLgClose}>
                    Close
                </Button>
                </Modal.Footer>
            </Modal>
        <Modal show={renameModal.open} onHide={handleRenameModalClose}>
            <Modal.Header closeButton>
            <Modal.Title>{renameModal.heading}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Control name='renameText' value={renameModal.renameText} onChange={handleRenameTextChange} />
            </Modal.Body>
            <Modal.Footer>
            <Button variant="primary" onClick={handleRenameSubmit}>
                Rename
            </Button>
            </Modal.Footer>
        </Modal>
        <Modal size='lg' show={modalLock.open} onHide={handleModalLockClose}>
            <Modal.Header closeButton>
            <Modal.Title>{modalLock.heading}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {modalLock.message1 != '' ? modalLock.message1 : null}
                {modalLock.message2 != '' ? (<div><br />{modalLock.message2}</div>) : null}
                {modalLock.message3 != '' ? (<div><br />{modalLock.message3}</div>) : null}
                {modalLock.boldMessage != '' ? (<div><br /><strong>{modalLock.boldMessage}</strong></div>) : null}
            </Modal.Body>
            <Modal.Footer>
            <Button variant="primary" onClick={handleModalLockRestore}>
                Restore
            </Button>
            <Button variant="primary" onClick={handleModalLockUnlock}>
                Unlock
            </Button>
            </Modal.Footer>
        </Modal>

    </div>)
}

export default WeekSystemHolidays;