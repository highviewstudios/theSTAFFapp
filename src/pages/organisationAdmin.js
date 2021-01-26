import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

//COMPONENTS
import LoginSettings from './orgAdminComponets/loginSettings';
import DepartmentSettings from './orgAdminComponets/departmentSettings';
import Users from './orgAdminComponets/users';
import Rooms from "./orgAdminComponets/rooms";
import Layouts from "./orgAdminComponets/layoutSettings";
import WeekSystemHolidays from './orgAdminComponets/weekSystemHolidays';
import UserProfiles from './orgAdminComponets/userProfiles';

//Styles
import Container from "react-bootstrap/Container";
import Jumbotron from "react-bootstrap/Jumbotron";


function OrganisationAdmin(props) {

  const orgID = props.match.params.id;

  const user = useSelector(state => state.user);
  const userProfile = useSelector(state => state.userProfile);

  useEffect(() => {
    document.title = "STAFF";
  },[]);

  return (
    <div className="body">
        <Container fluid className="p-3">
            <Jumbotron className="back-color">
            {userProfile.admin_loginSettings || user.role == 'seniorAdmin' ? (<LoginSettings orgID={orgID}/>) : null}<br />
            {userProfile.admin_departments || user.role == 'seniorAdmin' ? (<DepartmentSettings orgID={orgID}/>) : null}<br />
            {userProfile.admin_users || user.role == 'seniorAdmin' ? (<Users orgID={orgID} />) : null } <br />
            {userProfile.admin_rooms || user.role == 'seniorAdmin' ? (<Rooms orgID={orgID} />) : null } <br />
            {userProfile.admin_layouts || user.role == 'seniorAdmin' ? (<Layouts orgID={orgID} />) : null}<br />
            {userProfile.admin_weekSystemHolidays || user.role == 'seniorAdmin' ? (<WeekSystemHolidays orgID={orgID} />) : null }<br />
            {userProfile.admin_userProfiles || user.role == 'seniorAdmin' ? (<UserProfiles orgID={orgID} />) : null }
            </Jumbotron>
        </Container>
    </div>
  );
}

export default OrganisationAdmin;