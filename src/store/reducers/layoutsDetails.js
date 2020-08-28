const layoutsDetails = (state = {diaryDays: [], timetableDays: [], sessionTotal: 0, breakTotal: 0, sessionOrder: [], startTime: '', finishTime: '', timeInterval: '', sessions: {}}, action) => {
    switch(action.type){
        case 'LAYOUTS_UPDATE_DIARYDAYS':
            return {...state, diaryDays: action.value};
        case 'LAYOUTS_UPDATE_TIMETABLEDAYS':
            return {...state, timetableDays: action.value};
        case 'LAYOUTS_UPDATE_SESSIONTOTAL':
            return {...state, sessionTotal: action.value};
        case 'LAYOUTS_UPDATE_BREAKTOTAL':
            return {...state, breakTotal: action.value};
        case 'LAYOUTS_UPDATE_SESSIONORDER':
            return {...state, sessionOrder: action.value};
        case 'LAYOUTS_UPDATE_STARTTIME':
            return {...state, startTime: action.value};
        case 'LAYOUTS_UPDATE_FINISHTIME':
            return {...state, finishTime: action.value};
        case 'LAYOUTS_UPDATE_TIMEINTERVAL':
            return {...state, timeInterval: action.value};
        case 'LAYOUTS_UPDATE_SESSIONS':
            return {...state, sessions: action.value};
        default:
            return state;
    }
}

export default layoutsDetails;