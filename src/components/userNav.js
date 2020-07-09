import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../context/userContext';
import { AdminContext } from '../context/adminContext';
import ServerPath, { hostPath } from "../ServerPath";
import Axios from 'axios';
import { useHistory } from 'react-router-dom';

import Button from "react-bootstrap/Button";



function User() {

    const history = useHistory();

    const { user, updateUser } = useContext(UserContext);
    const { admin } = useContext(AdminContext);
    
    const [details, setDetails] = useState({
        name: '',
        show: false
    });
    const [page, setPage] = useState();

    useEffect(() => {
        getUser();
    }, [user, admin]);

    useEffect(() => {
        history.push(page);
        //setPage('');
    },[logOut])

    function getUser() {
        console.log("IN");
        console.log(admin);
        if(user.name !== '') {
            setDetails({
                name: user.name,
                show: true
            });
        } else {
            if(admin.access === 'granted') {
                setDetails({
                    name: "High-View-Studios",
                    show: true
                })
            }
        }
        console.log(user);
    }

    function logOut() {
        Axios.get("/logout")
        .then(res => {
            console.log(res.data.message);
            if(res.data.message === "User logged out") {
                setDetails({name: '', show: false});
                setPage('/');
                console.log("Redirect")
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