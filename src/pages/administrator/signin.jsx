import React, { useState, useEffect } from 'react';
import ServerPath, { hostPath } from "../../ServerPath";
import {useSelector} from 'react-redux';
import { useHistory } from 'react-router-dom';

//Styles
import Button  from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Jumbotron from "react-bootstrap/Jumbotron";
import Form from "react-bootstrap/Form";

function SignIn() {

    const [granted, setGranted] = useState(true);
    const user = useSelector(state => state.user);
    const history = useHistory();

    useEffect(() => {
        ServerPath();
        onOpen();
    },[])

    function onOpen() {
        if(user.auth) {
            if(user.role == "superAdmin") {
                history.push('/');
            } else {
                setGranted(false);
            }
        }
    }

    return (
        <div className="body">
            <Container className="p-3">
                <Jumbotron className="back-color">
                    <h1>Administrator Sign In</h1>
                    {!granted ? (
                    <div>
                    <h1>Access Denied</h1>
                    <Button variant="warning" href='/'>Back to Home </Button><br /><br />
                    </div>
                    ):(
                    <div>
                    <br />
                    <Button variant="dark" href={hostPath + "/auth/github"}><i class="fab fa-github"></i>  Log in with Github</Button><br /><br />
                    </div> 
                    
                    )}
                </Jumbotron>
            </Container>
        </div>
    )
}

export default SignIn;