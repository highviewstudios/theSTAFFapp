import userDetails from './userDetails';
import organisationDetails from './organisationDetails';
import {combineReducers} from 'redux'

const rootReducer = combineReducers({
    user: userDetails,
    organisation: organisationDetails
});

export default rootReducer;