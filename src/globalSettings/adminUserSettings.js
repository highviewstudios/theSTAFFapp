import { UpdateUUID, UpdateFromDetails } from '../store/actions/globalSettings/adminUserGlobalSettings';

export function setGUserID(dispatch, id) {

    dispatch(UpdateUUID(id));
}

export function setFromDetails(dispatch, value) {

    dispatch(UpdateFromDetails(value));
}