export const orgUpdateName = (val) => {
    return {
        type: "ORG_UPDATE_NAME",
        value: val
    };
}

export const orgUpdateSignInLocal = (val) => {
    return {
        type: "ORG_UPDATE_SIGNIN_LOCAL",
        value: val
    };
}

export const orgUpdateSignInGoogle = (val) => {
    return {
        type: "ORG_UPDATE_SIGNIN_GOOGLE",
        value: val
    };
}