const HomePageGlobalSettings = (state = {tab: 'home', formSent: false, dataError: false}, action) => {

    switch(action.type){
        case 'UPDATE_TAB':
            return {...state, tab: action.value};
        case 'UPDATE_FORMSENT':
            return {... state, formSent: action.value}
        case 'UPDATE_DATAERROR':
            return {...state, dataError: action.value}
        default:
            return state;
    }
}

export default HomePageGlobalSettings;