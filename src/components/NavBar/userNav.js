import React, { useContext, useState, useEffect } from 'react';
import ServerPath, { hostPath } from "../../ServerPath";
import Axios from 'axios';
import { useHistory } from 'react-router-dom';
import {useSelector, useDispatch} from 'react-redux';
import {userUpdateAuth, userUpdateName, userUpdateRole} from "../../store/actions"


import Button from "react-bootstrap/Button";

function User() {

    const history = useHistory();
    const user = useSelector(state => state.user);
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

        console.log(user);
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
                dispatch(userUpdateAuth(false));
                dispatch(userUpdateName(''));
                dispatch(userUpdateRole(''));
                history.push('/signin');
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
            <Button variant="warning" onClick={logOut}>Log Out</Button>
            </div>
        ) : (
            <div>
            </div>
        )}   
        </div>
        
    )
}

export default User;