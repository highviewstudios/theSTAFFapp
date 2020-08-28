import userDetails from './userDetails';
import organisationDetails from './organisationDetails';
import layoutsDetails from './layoutsDetails';
import globalVars from './globalVars';
import {combineReducers} from 'redux'

const rootReducer = combineReducers({
    user: userDetails,
    organisation: organisationDetails,
    layouts: layoutsDetails,
    globalVars: globalVars
});

export default rootReducer;