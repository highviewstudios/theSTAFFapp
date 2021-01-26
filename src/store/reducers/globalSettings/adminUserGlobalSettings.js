const AdminUserGlobalSettings = (state = {uuid: 0, fromDetails: false}, action) => {

    switch(action.type) {
        case 'UPDATE_ADMINU_UUID':
            return {...state, uuid: action.value};
        case 'UPDATE_ADMINU_FROMDETAILS':
            return {...state, fromDetails: action.value};
        default:
            return state;
    }
}

export default AdminUserGlobalSettings;