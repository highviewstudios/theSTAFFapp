export const UpdateTabSettings = (val) => {
    return {
        type: 'UPDATE_TAB',
        value: val
    };
}

export const UpdateFromSent = (val) => {
    return {
        type: 'UPDATE_FORMSENT',
        value: val
    };
}

export const UpdateDataError = (val) => {
    return {
        type: 'UPDATE_DATAERROR',
        value: val
    };
}