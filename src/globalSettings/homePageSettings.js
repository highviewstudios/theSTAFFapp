import { UpdateTabSettings, UpdateFromSent, UpdateDataError } from '../store/actions/globalSettings/homePageGlobalSettings';

export function UpdateTab(dispatch, tab) {
    dispatch(UpdateTabSettings(tab));
}

export function UpdateFormSettings(dispatch, sent) {
    dispatch(UpdateFromSent(sent));
}

export function UpdateDataErrorSetting(dispatch, value) {
    dispatch(UpdateDataError(value));
}