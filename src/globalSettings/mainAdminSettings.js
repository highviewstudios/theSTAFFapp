import { UpdateOrganisations } from '../store/actions/globalSettings/mainAdminGlobalSettings';

export function UpdateOrganisationsSettings(dispatch, organisations) {
    dispatch(UpdateOrganisations(organisations));
}