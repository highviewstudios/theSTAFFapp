import React, { createContext, useState } from 'react';

export const SessionsContext = createContext();

function SessionsContextProvider(props) {

    const [sessions, setSessions] = useState({});
    const [order, setOrder] = useState([]);

    const [breakBtns, setBreakBtns] = useState({
        view: false,
        breakID: ''
    });

    function addSession(id) {

        setSessions(prevState => {
            return {...prevState, [id]: {id: id, customText: '', hoverText: ''}};
        });

        setOrder(prevState => {
            return [...prevState, id];
        })
    }

    function minusSession(index) {

        const tempSessions = sessions;
        setSessions({});
        for(var i = 0; i < order.length; i++) {
            const orderIndex = order[i];

            if(orderIndex != index) {

                let temp = {};
                if(orderIndex.toString().includes('b')) {
                    temp = {id: tempSessions[orderIndex].id, breakText: tempSessions[orderIndex].breakText, textColor: tempSessions[orderIndex].textColor, bgColor: tempSessions[orderIndex].bgColor};
                } else {
                     temp = {id: tempSessions[orderIndex].id, customText: tempSessions[orderIndex].customText, hoverText: tempSessions[orderIndex].hoverText};
                }
                
                setSessions(prevState => {
                    return {...prevState, [orderIndex]: temp}
                });
                
            }
        }

        setOrder(() => {
            return order.filter(session => {
                return session != index;
            }); 
        });
    }

    function SetSessions(data) {
        setSessions(data);
    }

    function SetOrder(data) {
        setOrder(data);
    }

    function addBreak(id) {

        const name = 'b' + id;
        setSessions(prevState => {
            return {...prevState, [name]: {id: name, breakText: '', textColor: '#000000', bgColor: '#FFFFFF'}};
        });

        setOrder(prevState => {
            return [...prevState, name];
        })
    }

    function toggleBreakBtns(id, value) {

        if(value) {
            setBreakBtns(prevState => {
                return {...prevState, view: value, breakID: id}
            });
        } else {
        setBreakBtns(prevState => {
            return {...prevState, view: value}
        });
        }
    }

    function orderMoveUp() {

        const ID = order.indexOf(breakBtns.breakID);

        if((ID - 1) >= 0) {

            const value = order[ID]; 
            order.splice(ID, 1);

            const newID = ID - 1;
            order.splice(newID, 0, value);

            setOrder(order);

            //force to update
            setOrder(prevState => {
                return [...prevState];
            });
        } 
    }

    function orderMoveDown() {

        const ID = order.indexOf(breakBtns.breakID);

        if((ID + 1) < order.length) {

            const value = order[ID]; 
            order.splice(ID, 1);

            const newID = ID + 1;
            order.splice(newID, 0, value);

            setOrder(order);

            //force to update
            setOrder(prevState => {
                return [...prevState];
            });
        }
    }

    function removeBreak() {

        const ID = order.indexOf(breakBtns.breakID);
        let breID = 1;
        const tempSessions = sessions;
        let newOrder = [];
        setSessions({});
        for(var i = 0; i < order.length; i++) {
            const orderIndex = order[i];

            if(orderIndex != breakBtns.breakID) {

                let temp = {};
                if(orderIndex.toString().includes('b')) {
                    const newID = 'b' + breID;
                    temp = {id: newID, breakText: tempSessions[orderIndex].breakText, textColor: tempSessions[orderIndex].textColor, bgColor: tempSessions[orderIndex].bgColor};

                    setSessions(prevState => {
                        return {...prevState, [newID]: temp}
                    });
                    newOrder.push(newID)
                    breID++;
                } else {
                     temp = {id: tempSessions[orderIndex].id, customText: tempSessions[orderIndex].customText, hoverText: tempSessions[orderIndex].hoverText};

                     setSessions(prevState => {
                        return {...prevState, [orderIndex]: temp}
                    });
                    newOrder.push(orderIndex);
                }
                
                
            }
        }

        setOrder(newOrder);

        //force to update
        setOrder(prevState => {
            return [...prevState];
        });

        setBreakBtns(prevState => {
            return {...prevState, view: false}
        })
    }


    function resetSessions() {
        setSessions({});
        setOrder([]);
    }

    function updateCustomText(id, text) {

        const obj = {customText: text, hoverText: sessions[id].hoverText, id: sessions[id].id}
        setSessions(prevState => {
            return {...prevState, [id]: obj}
        })
    }

    function updateHoverText(id, text) {

        const obj = {customText: sessions[id].customText, hoverText: text, id: sessions[id].id}
        setSessions(prevState => {
            return {...prevState, [id]: obj}
        })
    }

    function updateBreakText(text) {

        const obj = {id: sessions[breakBtns.breakID].id, breakText: text, textColor: sessions[breakBtns.breakID].textColor, bgColor: sessions[breakBtns.breakID].bgColor}
        setSessions(prevState => {
            return {...prevState, [breakBtns.breakID]: obj}
        })
    }

    function updateBreakColor(name, value) {

        let obj = {};
        if(name === 'textColor') {
            obj = {id: sessions[breakBtns.breakID].id, breakText: sessions[breakBtns.breakID].breakText, textColor: value, bgColor: sessions[breakBtns.breakID].bgColor}
        }
        if(name === 'bgColor') {
            obj = {id: sessions[breakBtns.breakID].id, breakText: sessions[breakBtns.breakID].breakText, textColor: sessions[breakBtns.breakID].textColor, bgColor: value}
        }
        setSessions(prevState => {
            return {...prevState, [breakBtns.breakID]:obj}
        })
    }

    return (
        <SessionsContext.Provider value={{sessions, order, breakBtns, addSession, resetSessions, minusSession, updateCustomText, updateHoverText, addBreak, toggleBreakBtns, 
                                            orderMoveUp, orderMoveDown, removeBreak, updateBreakText, updateBreakColor, SetSessions, SetOrder}}>
            {props.children}
        </SessionsContext.Provider> 
    )
}

export default SessionsContextProvider;