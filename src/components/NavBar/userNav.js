import React, { useState, useEffect } from 'react';
import ServerPath, { hostPath } from "../../ServerPath";
import Axios from 'axios';
import { useHistory } from 'react-router-dom';
import {useSelector, useDispatch} from 'react-redux';
import {userUpdateAuth, userUpdateName, userUpdateRole, userUpdateNew, userUpdateRequestedPassword, userUpdateOrgID, userUpdateUserDepartments} from "../../store/actions/user";
import { ResetUserProfileSettingsToDefault } from '../../globalSettings/userProfileSettings'
import { UpdateBookingEdit } from '../../store/actions/bookings';

import Dropdown from "react-bootstrap/Dropdown";
import Button from "react-bootstrap/Button";


function User() {

    const history = useHistory();
    const user = useSelector(state => state.user);
    const userProfile = useSelector(state => state.userProfile)
    const dispatch = useDispatch();
    
    const [details, setDetails] = useState({
        name: '',
        show: false
    });
    
    useEffect(() => {
        ServerPath();
    },[])

    useEffect(() => {
        getUser();
    }, [user]);

    function getUser() {

        //console.log(user);
        if(user.auth) {

            if(user.role == "superAdmin") {
                setDetails({
                    name: "High-View Studios",
                    show: true
                });
            } else {
                setDetails({
                    name: user.name,
                    show: true
                });
            }
        } else {
            setDetails({
                name: '',
                show: false
            })
        }
    }

    function logOut() {
        Axios.get("/logout")
        .then(res => {
            console.log(res.data.message);
            if(res.data.message === "User logged out") {
                console.log(user);
                let page;
                if(user.role == 'superAdmin') {
                    page = "/";
                } else {
                    const orgID = user.orgID;
                    page = '/org/' + orgID + '/signIn';
                }
                dispatch(userUpdateAuth(false));
                dispatch(userUpdateName(''));
                dispatch(userUpdateRole(''));
                dispatch(userUpdateNew(''));
                dispatch(userUpdateRequestedPassword(false));
                dispatch(userUpdateUserDepartments([]));
                dispatch(userUpdateOrgID(''));
                dispatch(UpdateBookingEdit(false));
                ResetUserProfileSettingsToDefault(dispatch);
                history.push(page);
            }
        })
        .catch(err => {
            console.log(err);
        })
    }

    return (
        <div>
        {/* <Button variant="warning" onClick={logOut}>Log Out</Button> */}
        {details.show ? (
            <div>
            <strong>User: {details.name}</strong><br />
            {user.role == "seniorAdmin" || userProfile.orgAdminAccess ? (
                <div>
                <Dropdown>
            <Dropdown.Toggle variant="warning" id="dropdown-basic">
                Page
            </Dropdown.Toggle><Button variant="warning" onClick={logOut}>Log Out</Button>

            <Dropdown.Menu>
                <Dropdown.Item onClick={() => history.push('/')}>Organisation Home</Dropdown.Item>
                <Dropdown.Item onClick={() => history.push('/org/'+ user.orgID +'/organisationAdmin')}>Organisation Admin</Dropdown.Item>
            </Dropdown.Menu>
            </Dropdown>
                </div>) : (
                    <div>
                    <Button variant="warning" onClick={logOut}>Log Out</Button>
                </div>)}
            
            </div>
        ) : (
            <div>
            </div>
        )}   
        </div>
        
    )
}

export default User;