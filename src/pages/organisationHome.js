import React, { useEffect, useContext, useState } from 'react';
import {useSelector, useDispatch} from 'react-redux';
import { orgUpdateName, orgUpdateSignInLocal, orgUpdateSignInGoogle } from "../store/actions/organistion";
import { useHistory } from 'react-router-dom';
import Axios from 'axios';

//Styles
import Button from "react-bootstrap/Button"
import Container from "react-bootstrap/Container";
import Jumbotron from "react-bootstrap/Jumbotron";


function OrganisationHome(props) {
  
  const organisationId = props.match.params.id;

  const user = useSelector(state => state.user);
  const [orgTitle, setOrgTitle] = useState('');
  const history = useHistory();
  const dispatch = useDispatch();

  useEffect(() => {
    document.title = "STAFF";
    getOrgisation();
  },[]);

  function getOrgisation() {

    const url = '/organisation/' + organisationId;
    Axios.get(url)
    .then(res => {
      if(res.data.userError != "Yes") {

        dispatch(orgUpdateName(res.data.organisation.name));
        dispatch(orgUpdateSignInLocal(res.data.organisation.auth_Local));
        dispatch(orgUpdateSignInGoogle(res.data.organisation.auth_Google));
        
        if(user.auth == false) {
          history.push('/org/' + organisationId + '/signIn');
        } else {
          if(user.orgID != organisationId) {
            history.push('/org/'+ user.orgID +'/wrongOrganisation');
          } else if (user.requestedPassword == 'true') {
            history.push('/org/'+ organisationId +'/changePassword');
          } else if(user.new == 'true') {
            history.push('/org/' + organisationId +'/createPassword');
          } else {
            console.log(res.data.organisation);
            setOrgTitle(res.data.organisation.name);
          }
        }
      } else {
        history.push('/');
      }
    })
    .catch(err => {
      console.log(err);
    })
  }

  return (
    <div className="body">
        <Container fluid className="p-3">
            <Jumbotron className="back-color">
              <h1>Organisation Home</h1>
              <h3>{orgTitle}</h3>
            </Jumbotron>
        </Container>
    </div>
  );
}

export default OrganisationHome;