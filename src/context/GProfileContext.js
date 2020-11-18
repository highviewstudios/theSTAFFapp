import React, { createContext, useState} from 'react'

export const GProfileContext = createContext();

function GProfileContextProvider(props) {

    const [GProfile, setGProfile] = useState({
        uuid: '',
        name: ''
    });

    function setIDAndName(id, name) {

        setGProfile(prevState => {
            return {...prevState, uuid: id, name: name};
        });
    }

    return (
        <GProfileContext.Provider value={{GProfile, setIDAndName}}>
            {props.children}
        </GProfileContext.Provider>
    )
}

export default GProfileContextProvider;