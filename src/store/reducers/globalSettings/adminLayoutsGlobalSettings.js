const AdminLayoutsGlobalSettings = (state = {sessions: {}, order: [], breakBtns: {view: false, breakID: ''}}, action) => {

    switch(action.type) {
        case 'UPDATE_SESSIONS':
            return {...state, sessions: action.value};
        case 'UPDATE_ORDER':
            return {...state, order: action.value};
        case 'UPDATE_BREAKBTNS':
            return {...state, breakBtns: action.value};
        default:
            return state;
    }
}

export default AdminLayoutsGlobalSettings;