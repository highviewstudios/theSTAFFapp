import React, { useEffect} from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

//Styles
import Button  from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Jumbotron from "react-bootstrap/Jumbotron";
import Form from "react-bootstrap/Form";

//COMPONENTS
import OrganisationList from '../../components/pages/administrator/organisationList';

function Home() {

  const history = useHistory();
    const user = useSelector(state => state.user);
    console.log('viewed...');
    if(!user.auth || user.role != "superAdmin") {
            history.push('/administrator/signIn');
    }

  useEffect(() => {
    document.title = "STAFF - Administrator";
  },[]);

  return (
    <div className="body">
      <Container fluid className="p-3">
            <Jumbotron className="back-color">
              <OrganisationList />
            </Jumbotron>
        </Container>
    </div>
  );
}

export default Home;