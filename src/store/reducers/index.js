import userDetails from './userDetails';
import organisationDetails from './organisationDetails';
import globalVars from './globalVars';
import bookings from './bookings';
import userProfile from './userProfile';

import HomePageGlobalSettings from './globalSettings/homePageGlobalSettings';
import AdminLayoutsGlobalSettings from './globalSettings/adminLayoutsGlobalSettings';
import UserProfileAdminGlobalSettings from './globalSettings/userProfileAdminGlobalSettings';
import AdminProfileGlobalSettings from './globalSettings/adminProfileGlobalSettings';
import AdminUserGlobalSettings from './globalSettings/adminUserGlobalSettings';

import {combineReducers} from 'redux'

const rootReducer = combineReducers({
    user: userDetails,
    organisation: organisationDetails,
    globalVars: globalVars,
    bookings: bookings,
    userProfile: userProfile,

    //SETTINGS
    HomePageGlobalSettings: HomePageGlobalSettings,
    AdminLayoutsGlobalSettings: AdminLayoutsGlobalSettings,
    UserProfileAdminGlobalSettings: UserProfileAdminGlobalSettings,
    AdminProfileGlobalSettings: AdminProfileGlobalSettings,
    AdminUserGlobalSettings: AdminUserGlobalSettings
});

export default rootReducer;