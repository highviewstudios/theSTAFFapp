const bookings = (state = {editBooking: false, bookingID: 0, user: '', department: '', sessionDes: '', sessionLength: '', bookingType: '', bookingUntil: '',  comments: '', createdBy: ''}, action) => {

    switch(action.type){
        case 'UPDATE_EDIT_BOOKING':
            return {...state, editBooking: action.value};
        case 'UPDATE_BOOKING_ID':
            return {...state, bookingID: action.value};
        case 'UPDATE_BOOKING_USER':
            return {...state, user: action.value};
        case 'UPDATE_BOOKING_DEPARTMENT':
            return {...state, department: action.value};
        case 'UPDATE_BOOKING_SESSIONDES':
            return {...state, sessionDes: action.value};
        case 'UPDATE_BOOKING_SESSIONLENGTH':
            return {...state, sessionLength: action.value};
        case 'UPDATE_BOOKING_BOOKINGTYPE':
            return {...state, bookingType: action.value};
        case 'UPDATE_BOOKING_BOOKINGUNTIL':
            return {...state, bookingUntil: action.value};
        case 'UPDATE_BOOKING_COMMENTS':
            return {...state, comments: action.value};
        case 'UPDATE_BOOKING_CREATEDBY':
            return {...state, createdBy: action.value};
        default:
            return state;
    }
}

export default bookings;