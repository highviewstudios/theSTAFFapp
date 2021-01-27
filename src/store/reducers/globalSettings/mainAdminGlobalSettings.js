const MainAdminGlobalSettings = (state = {organisations: []}, action) => {

    switch(action.type){
        case 'MAIN_UPDATE_ORGANISATIONS':
            return {...state, organisations: action.value};
        default: 
            return state;
    }
}

export default MainAdminGlobalSettings;