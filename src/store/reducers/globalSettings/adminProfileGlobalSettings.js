const AdminProfileGlobalSettings = (state = {uuid: '', name: ''}, action) => {

    switch(action.type) {
        case 'UPDATE_ADMINP_UUID':
            return {...state, uuid: action.value};
        case 'UPDATE_ADMINP_NAME':
            return {...state, name: action.value};
        default:
            return state;
    }
}

export default AdminProfileGlobalSettings;