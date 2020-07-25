const organisationDetails = (state = {name: '', signInLocal: false, signInGoogle: false}, action) => {
    switch(action.type){
        case 'ORG_UPDATE_NAME':
            return {...state, name: action.value};
        case 'ORG_UPDATE_SIGNIN_LOCAL':
            return {...state, signInLocal: action.value};
        case 'ORG_UPDATE_SIGNIN_GOOGLE':
            return {...state, signInGoogle: action.value};
        default:
            return state
    }
}

export default organisationDetails;