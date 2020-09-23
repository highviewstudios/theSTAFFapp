const organisationDetails = (state = {name: '', signInLocal: false, signInGoogle: false, message: '', useDepartments: false, noOfDepartments: '', departments: [], allocatedRooms: 0, 
                                    redeemedRooms: 0, rooms:[], layouts: [], holidays: [], locked: false}, action) => {
    switch(action.type){
        case 'ORG_UPDATE_NAME':
            return {...state, name: action.value};
        case 'ORG_UPDATE_SIGNIN_LOCAL':
            return {...state, signInLocal: action.value};
        case 'ORG_UPDATE_SIGNIN_GOOGLE':
            return {...state, signInGoogle: action.value};
        case 'ORG_UPDATE_MESSAGE':
            return {...state, message: action.value};
        case 'ORG_UPDATE_USEDEPARTMENTS':
            return {...state, useDepartments: action.value};
        case 'ORG_UPDATE_NOOFDEPARTMENTS':
            return {...state, noOfDepartments: action.value};
        case 'ORG_UPDATE_DEPARTMENTS':
            return {...state, departments: action.value};
         case 'ORG_UPDATE_ALLOCATEDROOMS':
            return {...state, allocatedRooms: action.value};
         case 'ORG_UPDATE_REDEEMEDROOMS':
            return {...state, redeemedRooms: action.value};
        case 'ORG_UPDATE_ROOMS':
            return {...state, rooms: action.value};
        case 'ORG_UPDATE_LAYOUTS':
            return {...state, layouts: action.value};
        case 'ORG_UPDATE_HOLIDAYS':
            return {...state, holidays: action.value};
        case 'ORG_UPDATE_LOCKED':
            return {...state, locked: action.value};
        default:
            return state
    }
}

export default organisationDetails;