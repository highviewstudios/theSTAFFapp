import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Axios from 'axios';
import OrganisationItem from './organisationItem';

//Styles
import Button  from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import { Row, Col } from 'react-bootstrap';

function OrganisationList() {

    
    const history = useHistory();
    const [loaded, setLoaded] = useState(false);
    const [organisations, setOrganisations] = useState([]);

    useEffect(() => {
        onOpen();
    }, []);
    
    function onOpen() {

        Axios.get('/organisation/all')
        .then(res => {
            setOrganisations(res.data);
            setLoaded(true);
        })
        .catch(err => {
            console.log(err);
        })
    }

   return (
        <div>
            <div className="AH-AddOrganisationBtn">
                <Button variant="warning" onClick={() => history.push("/administrator/organisationRegister")}>Add Organisation</Button>
            </div>
            <br />
            {loaded ? (
                <div><Card body className='Organisations-ListTitles'>
            <Row>
                <Col>
                    <label>Name</label>
                </Col>
                <Col>
                    <label>Email</label>
                </Col>
                <Col>
                    <label>Point of Contact</label>
                </Col>
                <Col>
                    <label>Unquie URL</label>
                </Col>
            </Row>
            </Card>
            <br />
            {organisations.map((organisation, index) => {
               return (
                   <div key={index}>
                        <OrganisationItem name={organisation.name} email={organisation.POC_Email} poc={organisation.POC_Name} id={organisation.url} />
                        <br />
                    </div>)
            })}
            </div>) : (<div></div>)}
            
        
        </div>
   )
}

export default OrganisationList;