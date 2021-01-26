import React, {useEffect} from 'react';
import { useSelector } from 'react-redux';
import {Button, Container, Jumbotron} from 'react-bootstrap';
import { useHistory } from 'react-router-dom';


function OrganisationNotFound() {

    const history = useHistory();
    const HomePageGlobalSettings = useSelector(state => state.HomePageGlobalSettings);

    function home() {
        history.push('/');
    }

    useEffect(() => {
        document.title = 'STAFF'
    }, []);

    return (
        <div className='body'>
            <Container fluid className='p-3'>
                <Jumbotron className='back-color'>
                    <h3>Organisation Not Found</h3>  <br /> <br />
                    <div className='home-contact-sent'>
                        <strong>Don't know the organisation's number?</strong><br />
                        Locate the Senior admin of your organisation or find your registration email to locate the direct URL <br /> <br />
                    </div>
                    <Button variant='primary' onClick={home}>Home</Button>
                    {HomePageGlobalSettings.dataError ? (<div>
                        <br />(data error)
                    </div>) : null}
                </Jumbotron>
            </Container>
        </div>
    );
}

export default OrganisationNotFound;