import { UpdateUUID, UpdateName} from '../store/actions/globalSettings/adminProfileGlobalSettings';

export function setIDAndName(dispatch, uuid, name) {

    dispatch(UpdateUUID(uuid));
    dispatch(UpdateName(name))
}