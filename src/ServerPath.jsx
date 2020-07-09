import React from "react";

let hostPath = "";

function BuildHostPath() {
    
    const host = window.location.hostname;
    const protocol = window.location.protocol;

    if(host === "localhost") {
        hostPath = protocol + "//" + host + ":8080";
    } else {
        hostPath = protocol +"//" + host;
    }  
}

export default BuildHostPath;
export { hostPath };