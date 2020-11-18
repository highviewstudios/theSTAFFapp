import React, { createContext, useState } from 'react';

export const GUserContext = createContext();

function GUserContextProvider(props) {

    const [GUser, setGUser] = useState({
        uuid: 0,
        fromDetails: false
    });

    function setGUserID(id) {

        setGUser(prevState => {
            return {...prevState, uuid: id};
        });
    }

    function setFromDetails(value) {

        setGUser(prevState => {
            return {...prevState, fromDetails: value}
        })
    }

    return (
        <GUserContext.Provider value={{GUser, setGUserID, setFromDetails}}>
            {props.children}
        </GUserContext.Provider>
    )
}

export default GUserContextProvider;