import React, { useEffect, useState } from 'react';
import { Route, Router, useHistory } from 'react-router-dom';
import { orgUpdateName, orgUpdateSignInLocal, orgUpdateSignInGoogle, orgUpdateMessage, orgUpdateUseDepartments, orgUpdateNoOfDepartments, orgUpdateDepartments, orgUpdateAllocatedRooms, orgUpdateRedeemedRooms, orgUpdateRooms, orgUpdateHolidays, orgUpdateLayouts, orgUpdateLocked } from "../store/actions/organistion";
import { UpdateFromSignIn } from '../store/actions/globalVars';

import OrganisationHome from "../pages/organisationHome";
import CollisionBookings from '../pages/orgAdminComponets/collisionBookings';
import ChangeofSeniorRequest from '../pages/orgAdminComponets/changeOfSeniorRequest';
import userDetails from '../pages/orgAdminComponets/userDetails';
import ForgotPassword from "../pages/forgotPassword";
import ChangePassword from '../pages/changePassword';
import CreatePassword from "../pages/createPassword";
import WrongOrganisation from '../pages/wrongOrganisation';

import OrganisationAdmin from "../pages/organisationAdmin";
import ProfileSettings from '../pages/orgAdminComponets/profileSettings';

import SignIn from "../pages/signIn";
import Axios from 'axios';
import {useSelector, useDispatch} from 'react-redux';

import GUserContextProvider from '../context/GUserContext';
import GProfileContextProvider from '../context/GProfileContext';


function OrganisationRouter(props) {

    const orgID = props.match.params.id;
    const user = useSelector(state => state.user);
    const globalVars = useSelector(state => state.globalVars);
    const dispatch = useDispatch();
    const history = useHistory();
    const [isLoaded, setLoaded] = useState(false);

    useEffect(() => {
        document.title = "STAFF";
        getOrgisation();
      },[globalVars.forceSignIn]);

    function getOrgisation() {

        const url = '/organisation/' + orgID;
        Axios.get(url)
        .then(res => {
          if(res.data.userError != "Yes") {
            dispatch(orgUpdateName(res.data.organisation.name));
            dispatch(orgUpdateSignInLocal((res.data.organisation.auth_Local == 'true')));
            dispatch(orgUpdateSignInGoogle((res.data.organisation.auth_Google == 'true')));
            dispatch(orgUpdateMessage(res.data.organisation.message));
            dispatch(orgUpdateUseDepartments((res.data.organisation.useDepartments == 'true')));
            dispatch(orgUpdateNoOfDepartments(res.data.organisation.noOfDepartments));
            dispatch(orgUpdateAllocatedRooms(res.data.organisation.allocatedRooms));
            dispatch(orgUpdateRedeemedRooms(res.data.organisation.redeemedRooms));
            dispatch(orgUpdateRooms(res.data.rooms));
            dispatch(orgUpdateLayouts(res.data.layouts));
            dispatch(orgUpdateHolidays(res.data.holidays));
            dispatch(orgUpdateLocked((res.data.organisation.locked == 'true')));

            if(user.auth == false) {
              history.push('/org/' + orgID + '/signIn');
            } else {
                if(user.orgID != orgID) {
                  history.push('/org/'+ user.orgID +'/wrongOrganisation');

                } else if (user.requestedPassword == 'true') {
                  history.push('/org/'+ orgID +'/changePassword');
                  
                } else if(user.new == 'true') {
                  history.push('/org/' + orgID +'/createPassword');

                } else if(user.SARequest == 'true') {
                  history.push('/org/' + orgID + '/changeOfSeniorRequest');
                } 
                else {
                  if(globalVars.fromSignIn) {
                    history.push('/org/' + orgID);
                  }
                }
            }
            setLoaded(true);
          } else {
            history.push('/');
          }
        })
        .catch(err => {
          console.log(err);
        })
    
        const data = {orgID: orgID}
        Axios.post('/organisation/allDepartments', data)
        .then(res => {
            dispatch(orgUpdateDepartments(res.data.departments));
        })
        .catch(err => {
          console.log(err);
        })
      }

    return (
        <div>
            {isLoaded ? (<div>
                <Route path='/org/:id' exact component={OrganisationHome} />
                <Route path='/org/:id/collisionBookings' component={CollisionBookings} />
                <GProfileContextProvider>
                <GUserContextProvider>
                <Route path="/org/:id/organisationAdmin" component={OrganisationAdmin} />
                <Route path="/org/:id/userDetails" component={userDetails} />
                <Route path="/org/:id/profileSettings" component={ProfileSettings} />
                </GUserContextProvider>
                </GProfileContextProvider>
                <Route path="/org/:id/signIn" component={SignIn} />
                <Route path="/org/:id/forgotPassword" component={ForgotPassword} />
                <Route path="/org/:id/changePassword" component={ChangePassword} />
                <Route path='/org/:id/changeOfSeniorRequest' component={ChangeofSeniorRequest} />
                <Route path="/org/:id/createPassword" component={CreatePassword} />
                <Route path='/org/:id/wrongOrganisation' component={WrongOrganisation} />
            </div>) : null}
        </div>
    )
}

export default OrganisationRouter;