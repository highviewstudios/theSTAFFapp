import React, { useEffect, useState } from 'react';
import { Container, Jumbotron } from 'react-bootstrap'
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Axois from 'axios';
import Axios from 'axios';

import BookingSlot from '../../components/pages/organisationAdmin/collides_bookingSlot';
import CollideSlot from '../../components/pages/organisationAdmin/collides_collideSlot';

function CollisionBookings(props) {

    const orgID = props.match.params.id;
    const organisation = useSelector(state => state.organisation);
    const globalVars = useSelector(state => state.globalVars);
    const history = useHistory();

    const [settings, setSettings] = useState({
        bookings: [],
    })


    useEffect(() => {
        onOpen();
    }, [globalVars.collideBookingsUpdate]);
    
    function onOpen() {
        if(!organisation.locked) {
            history.push('/org/' + orgID);
        } else {

            const data = {orgID, orgID}
            Axios.post('/organisation/collidedbookings', data)
            .then(res => {
                const data = res.data;

                if(data.error != 'null') {
                    history.push('/org/' + orgID + '/organisationAdmin');
                } else {
                    if(data.bookings.length > 0) {
                        WorkBookings(data.bookings, data.collides, data.sessions);
                    } else {
                        history.push('/org/' + orgID + '/organisationAdmin');
                    }
                }
            })
            .catch(err => {
                console.log(err);
            })
        }
    }

    function WorkBookings(bookings, collides, sessions) {

        for(const booking of bookings) {
            
            const sessionData = booking.sessions.split(',')[0];
            const firstSession = sessionData.split('-')[1];
            let layoutUUID = '';
            let layout = ''

            for(const room of organisation.rooms) {
                if(room.uuid == booking.roomID) {
                    booking.roomName = room.name;
                    layoutUUID = room.layout;
                }
            }

            for(const lay of organisation.layouts) {
                if(lay.uuid == layoutUUID) {
                    layout = lay.layout;
                }
            }

            if(layout == 'Timetable') {
                for(const sess of sessions) {
                    if(sess.layoutUUID == layoutUUID && formatString(sess.id) == firstSession) {
                        if(firstSession.includes('b')) {
                            if(sess.breakText != '') {
                                booking.firstSession = sess.breakText;
                            } else {
                                booking.firstSession = firstSession;
                            }
                        } else {
                            if(sess.customText != '') {
                                booking.firstSession = sess.customText;
                            } else {
                                booking.firstSession = firstSession;
                            }
                        }
                    }
                }
            } else if(layout == 'Diary') {
                booking.firstSession = firstSession[0] + firstSession[1] + ':' + firstSession[2] + firstSession[3];
            }

            const collideUUIDs = booking.collideUUID.split(',');

            let bookingCollides = [];
            for(const uuid of collideUUIDs) {

                for(const collide of collides) {

                    if(collide.uuid == uuid) {
                        const cSessionData = collide.sessions.split(',')[0];
                        const cFirstSession = cSessionData.split('-')[1];
                        
                        if(layout == 'Timetable') {
                            for(const sess of sessions) {
                                if(sess.layoutUUID == layoutUUID && formatString(sess.id) == cFirstSession) {
                                    if(cFirstSession.includes('b')) {
                                        if(sess.breakText != '') {
                                            collide.firstSession = sess.breakText;
                                        } else {
                                            collide.firstSession = cFirstSession;
                                        }
                                    } else {
                                        if(sess.customText != '') {
                                            collide.firstSession = sess.customText;
                                        } else {
                                            collide.firstSession = cFirstSession;
                                        }
                                    }
                                }
                            }
                        } else if(layout == 'Diary') {
                            collide.firstSession = cFirstSession[0] + cFirstSession[1] + ':' + cFirstSession[2] + cFirstSession[3];
                        }

                        bookingCollides.push(collide);
                    }
                }
            }

            booking.collideBookings = bookingCollides;
        }

        setSettings(prevState => {
            return {...prevState, bookings: bookings}
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

    return (
        <div className='body'>
            <Container fluid className='p-3'>
                <Jumbotron className='back-color'>
                    <h1>Collision Bookings</h1>
                    <br />
                    {settings.bookings.map((booking, index) => {
                        return(<div key={index}>
                            <BookingSlot orgID={orgID} uuid={booking.uuid} roomName={booking.roomName} user={booking.user} sessionDes={booking.sessionDes} bookingType={booking.bookingType} repeatType={booking.repeatType} startDate={booking.startDate} sessionTotal={booking.sessionTotal} session={booking.firstSession}/>

                            {settings.bookings[index].collideBookings.map((collide, index) => {
                                return <CollideSlot orgID={orgID} bookingUUID={booking.uuid} uuid={collide.uuid} key={index} user={collide.user} sessionDes={collide.sessionDes} bookingType={collide.bookingType} startDate={collide.startDate} sessionTotal={collide.sessionTotal} session={collide.firstSession}/>
                            })}
                            <br />
                        </div>) 
                    })}
                </Jumbotron>
            </Container>
        </div>
    )
}

export default CollisionBookings;