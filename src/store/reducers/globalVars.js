const globalVars = (state = {roomName: '', roomID: '', sessionID: '', sessionLabel: '', date: '', weekBeginDate: '', totalSessions: 0, dayList: [], layoutData: {}, weekSystem: false,
                            weekUUID: '', collideBookingsUpdate: false, startTime: '', finishTime: '', timeInterval: '', fromSignIn: false}, action) => {
    switch(action.type){
        case 'UPDATE_ROOM_NAME':
            return {...state, roomName: action.value};
        case 'UPDATE_ROOM_ID':
            return {...state, roomID: action.value};
        case 'UPDATE_ROOM_LAYOUT_DATA':
            return {...state, layoutData: action.value};
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
        case 'UPDATE_ROOM_WEEK_SYSTEM':
            return {...state, weekSystem: action.value};
        case 'UPDATE_ROOM_WEEK_UUID':
            return {...state, weekUUID: action.value};
        case 'UPDATE_FORCE_COLLIDED_BOOKINGS':
            return {...state, collideBookingsUpdate: action.value};
        case 'UPDATE_DIARY_START_TIME':
            return {...state, startTime: action.value};
        case 'UPDATE_DIARY_FINISH_TIME':
            return {...state, finishTime: action.value};
        case 'UPDATE_DIARY_TIME_INTERVAL':
            return {...state, timeInterval: action.value};
        case 'UPDATE_FROM_SIGNIN':
            return {...state, fromSignIn: action.value};
        default:
            return state;
    }
}

export default globalVars;