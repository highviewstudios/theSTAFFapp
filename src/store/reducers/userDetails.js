const userDetails = (state = {auth: false, name: '', email: '', role:'', new:'', requestedPassword: false, orgID: ''}, action) => {
    switch(action.type){
        case 'USER_UPDATE_AUTH':
            return {...state, auth: action.value};
        case 'USER_UPDATE_NAME':
            return {...state, name: action.value};
        case 'USER_UPDATE_EMAIL':
            return {...state, email: action.value};
        case 'USER_UPDATE_ROLE':
            return {...state, role: action.value};
        case 'USER_UPDATE_NEW':
            return {...state, new: action.value};
        case 'USER_UPDATE_REQUESTEDPASSWORD':
            return {...state, requestedPassword: action.value}
        case 'USER_UPDATE_ORGID':
            return {...state, orgID: action.value}
        default:
            return state
    }
}

export default userDetails;