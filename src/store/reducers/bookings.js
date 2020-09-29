const bookings = (state = {editBooking: false, bookingID: 0}, action) => {

    switch(action.type){
        case 'UPDATE_EDIT_BOOKING':
            return {...state, editBooking: action.value};
        case 'UPDATE_BOOKING_ID':
            return {...state, bookingID: action.value};
        default:
            return state;
    }
}

export default bookings;