const bookings = (state = {editBooking: false}, action) => {

    switch(action.type){
        case 'UPDATE_EDIT_BOOKING':
            return {...state, editBooking: action.value};
        default:
            return state;
    }
}

export default bookings;