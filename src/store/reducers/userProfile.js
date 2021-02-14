const userProfile = (state = {default: false, rooms: [], room_View: false, room_Write: false, room_Edit: false, room_Delete: false, room_Repeat: false,
                                viewAllUsers: false, viewAllDepartments: false, 
                                orgAdminAccess: false, admin_loginSettings: false, admin_departments: false, admin_users: false, admin_rooms: false, admin_layouts: false, admin_weekSystemHolidays: false, admin_userProfiles: false}, action) => {

    switch(action.type) {
        case 'UPUPDATE_DEFAULT':
            return {...state, default: action.value}
        case 'UPUPDATE_ROOMS':
            return {...state, rooms: action.value}
        case 'UPUPDATE_ROOM_VIEW':
            return {...state, room_View: action.value}
        case 'UPUPDATE_ROOM_WRITE':
            return {...state, room_Write: action.value}
        case 'UPUPDATE_ROOM_EDIT':
            return {...state, room_Edit: action.value}
        case 'UPUPDATE_ROOM_DELETE':
            return {...state, room_Delete: action.value}
        case 'UPUPDATE_ROOM_REPEAT':
            return {...state, room_Repeat: action.value}
        case 'UPUPDATE_VIEWALLUSERS':
            return {...state, viewAllUsers: action.value}
        case 'UPUPDATE_VIEWALLDEPARTMENTS':
            return {...state, viewAllDepartments: action.value}
        case 'UPUPDATE_ORGADMINACCESS':
            return {...state, orgAdminAccess: action.value}
        case 'UPUPDATE_ADMIN_LOGINSETTINGS':
            return {...state, admin_loginSettings: action.value}
        case 'UPUPDATE_ADMIN_DEPARTMENTS':
            return {...state, admin_departments: action.value}
        case 'UPUPDATE_ADMIN_USERS':
            return {...state, admin_users: action.value}
        case 'UPUPDATE_ADMIN_ROOMS':
            return {...state, admin_rooms: action.value}
        case 'UPUPDATE_ADMIN_LAYOUTS':
            return {...state, admin_layouts: action.value}
        case 'UPUPDATE_ADMIN_WEEKSYSTEMHOLIDAYS':
            return {...state, admin_weekSystemHolidays: action.value}
        case 'UPUPDATE_ADMIN_USERPROFILES':
            return {...state, admin_userProfiles: action.value}
        default:
            return state;
    }
}

export default userProfile;