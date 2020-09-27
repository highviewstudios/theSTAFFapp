import userDetails from './userDetails';
import organisationDetails from './organisationDetails';
import globalVars from './globalVars';
import {combineReducers} from 'redux'

const rootReducer = combineReducers({
    user: userDetails,
    organisation: organisationDetails,
    globalVars: globalVars
});

export default rootReducer;