import { UPUpdateDefault, UPUpdateRooms, UPUpdateRoom_View, UPUpdateRoom_Write, UPUpdateRoom_Edit, UPUpdateRoom_Delete, UPUpdateRoom_Repeat, UPUpdateViewAllUsers, UPUpdateViewAllDepartments, 
    UPUpdateOrgAdminAccess, UPUpdateOrgAdmin_loginSettings, UPUpdateOrgAdmin_departments, UPUpdateOrgAdmin_users, UPUpdateOrgAdmin_rooms, UPUpdateOrgAdmin_layouts, UPUpdateOrgAdmin_weekSystemHoldays, 
    UPUpdateOrgAdmin_userProfiles } from '../store/actions/userProfile';

import { ModifySettings } from '../store/actions/globalSettings/userProfileAdminGlobalSettings';

/* ----------SETTINGS DESCRPTIONS--------------------------

    varaible (action method) - description

    default (UPUpateDefault) - set the default profile on and off.
    rooms (UPUpateRooms) - holds the room data from the profile.
    room_View (UPUpdateRoom_View) - set the current room's view setting.
    room_Write (UPUpdateRoom_Write) - set the current room's write setting.
    room_Edit (UPUpdateRoom_Edit) - set the current room's edit setting.
    room_Delete (UPUpdateRoom_Delete) - set the current room's repeat setting.
    room_Repeat (UPUpdateRoom_Repeat) - set the current room's delete setting.
    viewAllUsers (UPUpateViewAllUsers) - set the current user to see only them or all of the users in the organisation.
    viewAllDepartments (UPUpateViewAllDepartments) - set the current use to see only their departments or all of the departments in the organisation.
    orgAdminAccess (UPUpateOrgAdminAccess) gives the current user access to the organisation admin.

*/

export function ResetUserProfileSettingsToDefault(dispatch) {

    dispatch(UPUpdateDefault(false));
    dispatch(UPUpdateRooms([]));
    dispatch(UPUpdateRoom_View(false));
    dispatch(UPUpdateRoom_Write(false));
    dispatch(UPUpdateRoom_Edit(false));
    dispatch(UPUpdateRoom_Delete(false));
    dispatch(UPUpdateRoom_Repeat(false));
    dispatch(UPUpdateViewAllUsers(false));
    dispatch(UPUpdateViewAllDepartments(false));
    dispatch(UPUpdateOrgAdminAccess(false));
    dispatch(UPUpdateOrgAdmin_loginSettings(false));
    dispatch(UPUpdateOrgAdmin_departments(false));
    dispatch(UPUpdateOrgAdmin_users(false));
    dispatch(UPUpdateOrgAdmin_rooms(false));
    dispatch(UPUpdateOrgAdmin_layouts(false));
    dispatch(UPUpdateOrgAdmin_weekSystemHoldays(false));
    dispatch(UPUpdateOrgAdmin_userProfiles(false));

}

export function setDefaultAccessLevelSettings(userStore, dispatch) {
    dispatch(UPUpdateDefault(true)); 

    //Access Level Settings
    if(userStore.role == 'user') {
        
        dispatch(UPUpdateRoom_View(true));
        dispatch(UPUpdateRoom_Write(true));

    } else if(userStore.role == 'admin') {

        dispatch(UPUpdateRoom_View(true));
        dispatch(UPUpdateRoom_Write(true));
        dispatch(UPUpdateRoom_Repeat(true));
        dispatch(UPUpdateRoom_Delete(true));

        dispatch(UPUpdateViewAllUsers(true));
        dispatch(UPUpdateViewAllDepartments(true));

    } else if(userStore.role == 'seniorAdmin') {

        dispatch(UPUpdateRoom_View(true));
        dispatch(UPUpdateRoom_Write(true));
        dispatch(UPUpdateRoom_Repeat(true));
        dispatch(UPUpdateRoom_Delete(true));

        dispatch(UPUpdateViewAllUsers(true));
        dispatch(UPUpdateViewAllDepartments(true));

        dispatch(UPUpdateOrgAdminAccess(true));
    }
}

export function setUserProfileSettings(dispatch, profile) {

    console.log(profile);
    dispatch(UPUpdateRooms(profile.rooms));
    dispatch(UPUpdateViewAllUsers(profile.viewAllUsers));
    dispatch(UPUpdateViewAllDepartments(profile.viewAllDepartments));

    dispatch(UPUpdateOrgAdminAccess(profile.orgAdminAccess));
    dispatch(UPUpdateOrgAdmin_loginSettings(profile.admin_loginSettings));
    dispatch(UPUpdateOrgAdmin_departments(profile.admin_departments));
    dispatch(UPUpdateOrgAdmin_users(profile.admin_users));
    dispatch(UPUpdateOrgAdmin_rooms(profile.admin_rooms));
    dispatch(UPUpdateOrgAdmin_layouts(profile.admin_layouts));
    dispatch(UPUpdateOrgAdmin_weekSystemHoldays(profile.admin_weekSystemHolidays));
    dispatch(UPUpdateOrgAdmin_userProfiles(profile.admin_userProfiles));
}

//THIS METHOD IS WHEN THE USER CHANGES THE ROOM ON THE FRONT END
export function updateRoomProfileSettings(dispatch, roomUUID, profile) {
    for(const room in profile.rooms) {

        
        if(profile.rooms[room].roomUUID == roomUUID) {
            dispatch(UPUpdateRoom_View((profile.rooms[room].prop_View == 'true')));
            dispatch(UPUpdateRoom_Write((profile.rooms[room].prop_Write == 'true')));
            dispatch(UPUpdateRoom_Edit((profile.rooms[room].prop_Edit == 'true')));
            dispatch(UPUpdateRoom_Delete((profile.rooms[room].prop_Delete == 'true')));
            dispatch(UPUpdateRoom_Repeat((profile.rooms[room].prop_Repeat == 'true')));
        }
    }
}

//ADMIN SETTINGS

export function setUserSettings(dispatch, settings) {

    dispatch(ModifySettings(settings));
}

export function updateSetting(store, dispatch, name, value) {

    let settings = store.settings;

    settings[name] = value;

    dispatch(ModifySettings(settings));
}

export function updateAdminSetting(store, dispatch, name, value) {

    let settings = store.settings;

    settings[name] = value;

    let mainAdminSetting;
    if(settings.admin_loginSettings || settings.admin_departments || settings.admin_users || settings.admin_rooms || settings.admin_layouts || settings.admin_weekSystemHolidays || settings.admin_userProfiles) {
        mainAdminSetting = true;
    } else {
        mainAdminSetting = false;
    }

    settings.orgAdminAccess = mainAdminSetting;

    dispatch(ModifySettings(settings));
}