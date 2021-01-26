const UserProfileAdminGlobalSettings = (state = {settings: {viewAllUsers: false, viewAllDepartments: false, orgAdminAccess: false, admin_loginSettings: false, admin_departments: false, admin_users: false,
                                                admin_rooms: false, admin_layouts: false, admin_weekSystemHolidays: false, admin_userProfiles: false}}, action) => {

        switch(action.type) {
            case 'MODIFY_SETTINGS':
                return {...state, settings: action.value};
            default:
                return state;
        }
    }

    export default UserProfileAdminGlobalSettings;