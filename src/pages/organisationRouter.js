import React, { useEffect, useState } from 'react';
import { Route, useHistory } from 'react-router-dom';
import { orgUpdateName, orgUpdateSignInLocal, orgUpdateSignInGoogle, orgUpdateMessage, orgUpdateUseDepartments, orgUpdateNoOfDepartments, orgUpdateDepartments, orgUpdateAllocatedRooms, orgUpdateRedeemedRooms, orgUpdateRooms, orgUpdateHolidays, orgUpdateLayouts, orgUpdateLocked } from "../store/actions/organistion";
import { setDefaultAccessLevelSettings, setUserProfileSettings } from '../globalSettings/userProfileSettings';

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

function OrganisationRouter(props) {

    const orgID = props.match.params.id;
    const user = useSelector(state => state.user);
    const globalVars = useSelector(state => state.globalVars);
    const UserProfileAdminGlobalSettings = useSelector(state => state.UserProfileAdminGlobalSettings);
    const dispatch = useDispatch();
    const history = useHistory();
    const [isLoaded, setLoaded] = useState(false);

    useEffect(() => {
        document.title = "STAFF";
        getOrgisation();
      },[]);

    function getOrgisation() {
        console.log('get org');
        const data = {orgID: orgID, userProfiles: user.profiles, userSettingsKeys: Object.keys(UserProfileAdminGlobalSettings.settings)}
        console.log(data);
        Axios.post('/organisation/getOrganisation', data)
        .then(res => {
          console.log(res.data);
          if(res.data.error != "Yes") {
            dispatch(orgUpdateName(res.data.organisation.name));
            dispatch(orgUpdateSignInLocal((res.data.organisation.auth_Local == 'true')));
            dispatch(orgUpdateSignInGoogle((res.data.organisation.auth_Google == 'true')));
            dispatch(orgUpdateMessage(res.data.organisation.message));
            dispatch(orgUpdateUseDepartments((res.data.organisation.useDepartments == 'true')));
            dispatch(orgUpdateNoOfDepartments(res.data.organisation.noOfDepartments));
            dispatch(orgUpdateDepartments(res.data.departments));
            dispatch(orgUpdateAllocatedRooms(res.data.organisation.allocatedRooms));
            dispatch(orgUpdateRedeemedRooms(res.data.organisation.redeemedRooms));
            dispatch(orgUpdateRooms(res.data.rooms));
            dispatch(orgUpdateLayouts(res.data.layouts));
            dispatch(orgUpdateHolidays(res.data.holidays));
            dispatch(orgUpdateLocked((res.data.organisation.locked == 'true')));

            //USER PROFILE
            if(!(res.data.organisation.useProfiles == 'true') ||  res.data.userProfile.default) {
                //default
                setDefaultAccessLevelSettings(user, dispatch);
            } else {
                setUserProfileSettings(dispatch, res.data.userProfile);
            }

            if(user.auth == false) {
              history.replace('/org/' + orgID + '/signIn');
            } else {
                if(user.orgID != orgID) {
                  history.replace('/org/'+ user.orgID +'/wrongOrganisation');

                } else if (user.requestedPassword == 'true') {
                  history.replace('/org/'+ orgID +'/changePassword');
                  
                } else if(user.new == 'true') {
                  history.replace('/org/' + orgID +'/createPassword');

                } else if(user.SARequest == 'true') {
                  history.replace('/org/' + orgID + '/changeOfSeniorRequest');
                } 
                else {
                  if(globalVars.fromSignIn) {
                    history.replace('/org/' + orgID);
                  }
                }
            }
            setLoaded(true);
          } else {
            history.replace('/');
          }
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
                
                <Route path="/org/:id/organisationAdmin" component={OrganisationAdmin} />
                <Route path="/org/:id/userDetails" component={userDetails} />
                <Route path="/org/:id/profileSettings" component={ProfileSettings} />

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