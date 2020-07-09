import React, { useEffect, useContext, useState } from "react";
import Axios from 'axios';
import { useHistory } from 'react-router-dom';
import { UserContext } from "../context/userContext";

function Auth() {

    const history = useHistory();
    let { updateUser } = useContext(UserContext)

    const [page, setPage] = useState();

    useEffect(() => {
       onOpen();
    },[])

    useEffect(() => {
        history.push(page);
    },[page])

   function onOpen() {

        Axios.get("/auth", {withCredentials: true })
        .then(res => {

            console.log(res.data);
            const isAuth = res.data.auth;

            if(isAuth) {
                updateUser("name", res.data.user.displayName);
                setPage('/home');
            }
            else {
               setPage('/signin');
            }
        })
        .catch(err => {
            console.log("Auth Err: " + err);
        
        })
    }
        

    return (
        <div>
        </div>
    )
}

export default Auth;