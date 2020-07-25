import React, {useEffect, useState} from 'react';
import axios from "axios";
import { useHistory } from 'react-router-dom';
import {useSelector} from 'react-redux';

//Styles
import Button  from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Jumbotron from "react-bootstrap/Jumbotron";
import Form from "react-bootstrap/Form";

function Register() {

    const history = useHistory();
    const user = useSelector(state => state.user);

    const [message, setMessage] = useState('');
    const [registed, setRegister] = useState(false);

    useEffect(() => {
        document.title = "STAFF - Register";
        onOpen();
    },[]);

    function onOpen() {
        if(user.auth) {
            history.push('/');
        }
    }

    function handleClick(event) {
        event.preventDefault();
        setMessage('');
        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const confirmpassword = document.getElementById("confirmpassword").value;
        
        const url = "/register/"+ name +"/"+ email +"/"+ password +"/"+ confirmpassword;
        axios.get(url)
        .then(res => {
            if(res.data.message === "User registered successfully") {
                setRegister(true);
            } else {
                if(res.data.userError === "Yes") {
                    setMessage(res.data.message);
                }
        }
        })
        .catch(err => {
            console.log(err);
        })
    }

    function handleLogin() {
        setRegister(false);
        history.push('/signIn')
    }

    
    return (
        <div className="body">
        <Container className="p-3">
            <Jumbotron className="back-color">
            <div className="header">
                <h2>Register</h2>
                {registed ? (
                    <div>
                    <h3> You have successfully been registered</h3><br />
                    <p>Please log in</p>
                    <Button type="submit" onClick={handleLogin} variant="warning">Login</Button>
                    </div>
                ) : (
                    <form>
                    <label id="lblName">Name:</label><br />
                    <input id="name" size="sm" type="text" required/><br />
                    <br />
                    <label id="lblEmail">Email:</label><br />
                    <input id="email" size="sm" type="email" required/><br />
                    <br />
                    <label id="lblPassword">Password:</label><br />
                    <input id="password" size="sm" type="password" required/><br />
                    <br />
                    <label id="lblConPassword">Confirm Password:</label><br />
                    <input id="confirmpassword" size="sm" type="password" required /><br />
                    <br />
                    <p>{message}</p>
                    <Button type="submit" onClick={handleClick} variant="warning">Register</Button>
                    </form> 
                )}
            </div>
            </Jumbotron>
        </Container>
        </div>
    )
}

export default Register;