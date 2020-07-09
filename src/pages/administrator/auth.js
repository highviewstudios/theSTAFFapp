import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { AdminContext } from '../../context/adminContext';
import Axios from 'axios';

function Auth() {
    
    const history = useHistory();

    const { updateAdmin } = useContext(AdminContext);
    const [page, setPage] = useState();

    useEffect(() => {
        onOpen();
    }, []);
    
    useEffect(() => {
        history.push(page);
    },[page])

    function onOpen() {
        
        Axios.get("/administrator/auth")
        .then(res => {
            const data = res.data;
            if(data.auth) {

                updateAdmin("access", data.access);

                if(data.access == "granted") {
                    setPage('/administrator/home');
                } else {
                    setPage('/administrator/signin');
                }
            } else {
                setPage('/administrator/signin');
            }
        })  
        .catch(err => {
            console.log(err);
        })
    }
    
    
    return (
        <div> 
        </div>
    )
}

export default Auth;