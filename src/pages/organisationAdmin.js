import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

//COMPONENTS
import LoginSettings from './orgAdminComponets/loginSettings';
import DepartmentSettings from './orgAdminComponets/departmentSettings';
import Users from './orgAdminComponets/users';
import Rooms from "./orgAdminComponets/rooms";
import Layouts from "./orgAdminComponets/layoutSettings";
import WeekSystemHolidays from './orgAdminComponets/weekSystemHolidays';

import SessionsContextProvider from '../context/adminTemplatesSessions';

//Styles
import Container from "react-bootstrap/Container";
import Jumbotron from "react-bootstrap/Jumbotron";


function OrganisationAdmin(props) {

  const orgID = props.match.params.id;

  const history = useHistory();

  useEffect(() => {
    document.title = "STAFF";
  },[]);

  return (
    <div className="body">
        <Container fluid className="p-3">
            <Jumbotron className="back-color">
              <LoginSettings orgID={orgID}/><br />
              <DepartmentSettings orgID={orgID}/><br />
              <Users orgID={orgID} /> <br />
              <Rooms orgID={orgID} /> <br />
              <SessionsContextProvider>
                <Layouts orgID={orgID} /> <br />
              </SessionsContextProvider>
              <WeekSystemHolidays orgID={orgID} />
            </Jumbotron>
        </Container>
    </div>
  );
}

export default OrganisationAdmin;