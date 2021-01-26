import React from 'react';

import { Row, Col, Image} from 'react-bootstrap';

import usersIcon from '../../public/images/icons/users.png';
import departmentsIcon from '../../public/images/icons/departments.png';
import roomsIcon from '../../public/images/icons/rooms.png';
import layoutsIcon from '../../public/images/icons/layouts.png';
import weekSystemIcon from '../../public/images/icons/weekSystemHolidays.png';
import userProfilesIcon from '../../public/images/icons/userProfiles.png';
import adminIcon from '../../public/images/icons/admin.png';


function Features() {


    return(<div>
    <Row>
        <Col className='features-alignRight'>
            <Image className='features-icon' src={usersIcon} />
        </Col>
        <Col className='features-alignLeft'>
            <strong>Users:</strong>
            <ul className='features-bulletPionts-square'>
                <li>Three types of accounts,
                    <ul>
                        <li>Basic ‘User’ - can book single bookings in any room</li>
                        <li>‘Admin’ - can book single and repeat bookings in any room, and can delete any booking.</li>
                        <li>‘Senior Admin’ - with this role you have got access to the organisation’s administration screen where you can make your organisation’s portal unique to you. 
                        See the administration section for more infromation</li>
                    </ul>
                </li>
            </ul>
        </Col>
        <Col className='features-alignRight'>
            <Image className='features-icon' src={departmentsIcon} />
        </Col>
        <Col className='features-alignLeft'>
            <strong>Departments:</strong>
            <ul className='features-bulletPionts-square'>
                <li>Assign users to departments so when they book out rooms they only can make a booking with their assigned departments.</li>
                <li>Edit departments’ names or remove them without affecting any bookings</li>
            </ul>
        </Col>
    </Row>
    <br /><br />
    <br /><br />
    <Row>
        <Col className='features-alignRight'>
            <Image className='features-icon' src={roomsIcon} />
        </Col>
        <Col className='features-alignLeft'>
            <strong>Rooms:</strong>
            <ul className='features-bulletPionts-square'>
                <li>Add as many rooms as you are allocated for</li>
                <li>Rename rooms in a single click</li>
                <li>Set different layouts to different rooms</li>
                <li>Have some rooms on the ‘week’ system and some rooms free running</li>
            </ul>
        </Col>
        <Col className='features-alignRight'>
            <Image className='features-icon' src={layoutsIcon} />
        </Col>
        <Col className='features-alignLeft'>
            <strong>Layouts:</strong>
            <ul className='features-bulletPionts-square'>
                <li>Have different layouts for different rooms</li>
                <li>Have different type of layouts, timetable or diary</li>
                <li>Include breaks into the layouts that can be coloured coded</li>
                <li>Add hover text or sessions, e.g. have the time which that session is on</li>
            </ul>
        </Col>
    </Row>
    <br /><br />
    <br /><br />
    <Row>
        <Col className='features-alignRight'>
                <Image className='features-icon' src={weekSystemIcon} />
            </Col>
            <Col className='features-alignLeft'>
                <strong>Week System / Holidays:</strong>
                <ul className='features-bulletPionts-square'>
                    <li>Some education settings have a two-week timetable, you can set this system to handle the timetable</li>
                    <li>Set each week to the correct ‘week’ number</li>
                    <li>Add holidays so repeated bookings miss the holidays</li>
                    <li>Built it locking and backup system for when editing the weeks</li>
                    <li>Collision detection on bookings and options to restore</li>
                </ul>
            </Col>
            <Col className='features-alignRight'>
                <Image className='features-icon' src={userProfilesIcon} />
            </Col>
            <Col className='features-alignLeft'>
                <strong>User Profiles:</strong>
                <ul className='features-bulletPionts-square'>
                    <li>Control which user sees which room</li>
                    <li>Have different settings for different rooms</li>
                    <li>Priority the user profiles to override some settings from other profiles for particular users</li>
                    <li>Have up to 5 profiles per user</li>
                    <li>Automatically have a default profile set up to support users that are not in a profile</li>
                </ul>
            </Col>
    </Row>
    <br /><br />
    <br /><br />
    <Row>
        <Col className='features-alignRight'>
                <Image className='features-icon' src={adminIcon} />
            </Col>
            <Col className='features-alignLeft'>
                <strong>Administration:</strong>
                <ul className='features-bulletPionts-square'>
                    <li>Have access to all the sections above to edit</li>
                    <li>Provide your organisation a system tailored to suit your needs</li>
                    <li>Have access to change users login method</li>
                    <li>Set an opening message for users at login</li>
                    <li>Direct users to use a particular login method by disabling and enabling them</li>
                    <li>Enable particular users to have access to the administration</li>
                </ul>
            </Col>
            <Col></Col>
            <Col></Col>
    </Row>
    </div>)
}

export default Features;