import React from 'react';
import { useHistory } from 'react-router-dom';

//Styles
import Button  from "react-bootstrap/Button";

function OrganisationList() {

    const history = useHistory();

   return (
        <div>
            <div className="AH-AddOrganisationBtn">
                <Button variant="warning" onClick={() => history.push("/administrator/organisationRegister")}>Add Organisation</Button>
            </div>

            <h1>No Organisations</h1>
        
        </div>
   )
}

export default OrganisationList;