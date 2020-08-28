const globalVars = (state = {roomName: '', roomID: '', sessionID: '', sessionLabel: '', date: '', weekBeginDate: '', totalSessions: 0, daylist: [], roomLayout: ''}, action) => {
    switch(action.type){
        case 'UPDATE_ROOM_NAME':
            return {...state, roomName: action.value};
        case 'UPDATE_ROOM_ID':
            return {...state, roomID: action.value};
        case 'UPDATE_ROOM_LAYOUT':
            return {...state, roomLayout: action.value};
        case 'UPDATE_ROOM_SESSION_ID':
            return {...state, sessionID: action.value};
        case 'UPDATE_ROOM_SESSION_LABEL':
            return {...state, sessionLabel: action.value};
        case 'UPDATE_ROOM_DATE':
            return {...state, date: action.value};
        case 'UPDATE_ROOM_WEEK_BEGIN':
            return {...state, weekBeginDate: action.value};
        case 'UPDATE_ROOM_TOTAL_SESSIONS':
            return {...state, totalSessions: action.value};
        case 'UPDATE_ROOM_DAY_LIST':
            return {...state, dayList: action.value};
        default:
            return state;
    }
}

export default globalVars;