import userDetails from './userDetails';
import organisationDetails from './organisationDetails';
import globalVars from './globalVars';
import bookings from './bookings';
import {combineReducers} from 'redux'

const rootReducer = combineReducers({
    user: userDetails,
    organisation: organisationDetails,
    globalVars: globalVars,
    bookings: bookings
});

export default rootReducer;