import userDetails from './userDetails';
import {combineReducers} from 'redux'

const rootReducer = combineReducers({
    user: userDetails,
});

export default rootReducer;