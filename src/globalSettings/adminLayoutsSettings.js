import { UpdateSessions, UpdateOrder, UpdateBreakBtns } from '../store/actions/globalSettings/adminLayoutsGlobalSettings';

export function resetSessions(dispatch) {
    dispatch(UpdateSessions({}));
    dispatch(UpdateOrder([]));
}

export function SetSessions(dispatch, data) {
    dispatch(UpdateSessions(data));
}

export function SetOrder(dispatch, data) {
    dispatch(UpdateOrder(data));
}

export function addSession(store, dispatch, id) {

    store.sessions[id] = {id: id, customText: '', hoverText: ''};
    store.order.push(id.toString());

    dispatch(UpdateSessions(store.sessions));
    dispatch(UpdateOrder(store.order));
}

export function minusSession(store, dispatch, index) {

    const tempSessions = store.sessions;
    let newSessions = {};
    
    let order = store.order;
    let newOrder = [];

    for(var i = 0; i < order.length; i++) {
        const orderIndex = order[i];

        if(orderIndex != index) {

            let temp = {};
            if(orderIndex.toString().includes('b')) {
                temp = {id: tempSessions[orderIndex].id, breakText: tempSessions[orderIndex].breakText, textColor: tempSessions[orderIndex].textColor, bgColor: tempSessions[orderIndex].bgColor};
            } else {
                 temp = {id: tempSessions[orderIndex].id, customText: tempSessions[orderIndex].customText, hoverText: tempSessions[orderIndex].hoverText};
            }

            newSessions[orderIndex] = temp;
            newOrder.push(orderIndex);   
        }
    }

    dispatch(UpdateSessions(newSessions));
    dispatch(UpdateOrder(newOrder));
}

export function addBreak(store, dispatch, id) {

    const name = 'b' + id;
    store.sessions[name] = {id: name, customText: '', hoverText: ''};
    store.order.push(name.toString());

    dispatch(UpdateSessions(store.sessions));
    dispatch(UpdateOrder(store.order));
}

export function removeBreak(store, dispatch) {
    
    let breID = 1;
    const tempSessions = store.sessions;

    let newSessions = {};
    let newOrder = [];
    
    for(var i = 0; i < store.order.length; i++) {
        const orderIndex = store.order[i];

        if(orderIndex != store.breakBtns.breakID) {

            let temp = {};
            if(orderIndex.toString().includes('b')) {
                const newID = 'b' + breID;
                temp = {id: newID, breakText: tempSessions[orderIndex].breakText, textColor: tempSessions[orderIndex].textColor, bgColor: tempSessions[orderIndex].bgColor};

                newSessions[newID] = temp;
                newOrder.push(newID)
                breID++;
            } else {
                 temp = {id: tempSessions[orderIndex].id, customText: tempSessions[orderIndex].customText, hoverText: tempSessions[orderIndex].hoverText};

                newSessions[orderIndex] = temp;
                newOrder.push(orderIndex);
            }
            
            
        }
    }

    dispatch(UpdateSessions(newSessions));
    dispatch(UpdateOrder(newOrder));

    dispatch(UpdateBreakBtns({view: false, breakID: ''}));
}

export function orderMoveUp(store, dispatch) {

    const ID = store.order.indexOf(store.breakBtns.breakID);
    let newOrder = store.order;

    if((ID - 1) >= 0) {

        const value = newOrder[ID]; 
        newOrder.splice(ID, 1);

        const newID = ID - 1;
        newOrder.splice(newID, 0, value);

        dispatch(UpdateOrder(newOrder));
    } 
}

export function orderMoveDown(store, dispatch) {

    const ID = store.order.indexOf(store.breakBtns.breakID);
    let newOrder = store.order;

    if((ID + 1) < newOrder.length) {

        const value = newOrder[ID]; 
        newOrder.splice(ID, 1);

        const newID = ID + 1;
        newOrder.splice(newID, 0, value);

        dispatch(UpdateOrder(newOrder));
    }
}

export function toggleBreakBtns(dispatch, id, value) {

    if(value) {
        dispatch(UpdateBreakBtns({view: value, breakID: id}));
    } else {
        dispatch(UpdateBreakBtns({view: value, breakID: ''}));
    }
}

export function updateCustomText(store, dispatch, id, text) {

    let sessions = store.sessions;

    const obj = {customText: text, hoverText: sessions[id].hoverText, id: sessions[id].id}

    sessions[id] = obj;

    dispatch(UpdateSessions(sessions));
}

export function updateHoverText(store, dispatch, id, text) {

    let sessions = store.sessions;

    const obj = {customText: sessions[id].customText, hoverText: text, id: sessions[id].id}

    sessions[id] = obj;

    dispatch(UpdateSessions(sessions));
}

export function updateBreakText(store, dispatch, text) {

    let sessions = store.sessions;

    const obj = {id: sessions[store.breakBtns.breakID].id, breakText: text, textColor: sessions[store.breakBtns.breakID].textColor, bgColor: sessions[store.breakBtns.breakID].bgColor}

    sessions[store.breakBtns.breakID] = obj
    
    dispatch(UpdateSessions(sessions));
}

export function updateBreakColor(store, dispatch, name, value) {

    let sessions = store.sessions;
    let obj = {};
    if(name === 'textColor') {
        obj = {id: store.sessions[store.breakBtns.breakID].id, breakText: store.sessions[store.breakBtns.breakID].breakText, textColor: value, bgColor: store.sessions[store.breakBtns.breakID].bgColor}
    }
    if(name === 'bgColor') {
        obj = {id: store.sessions[store.breakBtns.breakID].id, breakText: store.sessions[store.breakBtns.breakID].breakText, textColor: store.sessions[store.breakBtns.breakID].textColor, bgColor: value}
    }

    sessions[store.breakBtns.breakID] = obj;

    dispatch(UpdateSessions(sessions));
}