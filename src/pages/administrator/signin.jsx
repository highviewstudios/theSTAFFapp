import React, { useContext, useEffect } from 'react';
import { AdminContext } from '../../context/adminContext';
import ServerPath, { hostPath } from "../../ServerPath";
import { MDBIcon, MDBBtn } from 'mdbreact';

//Styles
import Button  from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Jumbotron from "react-bootstrap/Jumbotron";
import Form from "react-bootstrap/Form";

function SignIn() {

    const { admin } = useContext(AdminContext);

    useEffect(() => {
        document.title = "STAFF - Administrator Sign In";
        ServerPath();
    },[])

    return (
        <div className="body">
            <Container className="p-3">
                <Jumbotron className="back-color">
                    <h1>Administrator Sign In</h1>
                    {admin.granted == "denied" ? (
                    <div>
                    <h1>Access Denied</h1>
                    <Button variant="warning" href= {hostPath + "/administrator/logout"}>Log Out</Button>
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