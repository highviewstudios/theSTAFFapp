import React, { createContext, useState } from 'react';

export const AdminContext = createContext();

function AdminContextProvider(props) {

    const [admin, setUser] = useState({
        name: '',
        access: ''
    })

    function updateAdmin(field, value) {
        setUser((prevVal) => {
            return {...prevVal, [field]: value}
        })
    }

    return (
        <AdminContext.Provider value={{admin, updateAdmin}}>
            {props.children}
        </AdminContext.Provider>
    );
}

export default AdminContextProvider;