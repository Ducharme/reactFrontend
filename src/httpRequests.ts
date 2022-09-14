import { BaseShape, H3PolygonShape } from "./shapeTypes";

export const fetchCountPerHexaSync = async (endpoint: string, h3resolution: number, h3indices: [String]) => {
    const postData = {
        "h3resolution": h3resolution,
        "h3indices": h3indices
    };

    const fetchPayload = {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
        },
        body: JSON.stringify(postData),
    };

    try {
        var res = await fetch(endpoint, fetchPayload);
        const data = await res.json();
        return data;
    } catch (e) {
        console.log(e);
        return {};
    }
}

export interface ResponseIndice { [key: string]: number };
export interface Response {
    h3resolution: number;
    h3indices: ResponseIndice;
}

export const getCountPerHexaSync = (endpoint: string, h3resolution: number, h3indices: [String]) : Response => {
    const postData = {
        "h3resolution": h3resolution,
        "h3indices": h3indices
    };

    var payload = JSON.stringify(postData);
    var xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint, false); // false for synchronous request
    xhr.setRequestHeader("Content-Type", 'application/json');
    xhr.setRequestHeader("Accept", 'application/json');
    xhr.send(payload);

    //console.log(`readyState=${xhr.readyState} && status=${xhr.status} && responseText=${xhr.responseText}`);
    if (xhr.readyState === 4 && xhr.status === 200) {
        return JSON.parse(xhr.responseText);
    } else {
        return {'h3resolution': postData.h3resolution, 'h3indices': {}};
    };
}

export const searchShapesSync = (endpoint: string, status: string, h3indices: string[]) : BaseShape[] => {
    var postData = { "status": status, "h3indices": h3indices };
    var payload = JSON.stringify(postData);
    
    var xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint, false); // false for synchronous request
    xhr.setRequestHeader("Content-Type", 'application/json');
    xhr.setRequestHeader("Accept", 'application/json');
    xhr.send(payload);

    //console.log(`readyState=${xhr.readyState} && status=${xhr.status} && responseText=${xhr.responseText}`);
    if (xhr.readyState === 4 && xhr.status === 200) {
        return JSON.parse(xhr.responseText) as BaseShape[];
    } else {
        throw "Could not retrieve shapes";
    };
}

export const getPolygonFromHexaShapeSync = (endpoint: string, shapeIds: string[]) : H3PolygonShape[] => {
    var postData = { "shapeIds": shapeIds };
    var payload = JSON.stringify(postData);
    
    var xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint, false); // false for synchronous request
    xhr.setRequestHeader("Content-Type", 'application/json');
    xhr.setRequestHeader("Accept", 'application/json');
    xhr.send(payload);

    //console.log(`readyState=${xhr.readyState} && status=${xhr.status} && responseText=${xhr.responseText}`);
    if (xhr.readyState === 4 && xhr.status === 200) {
        return JSON.parse(xhr.responseText) as H3PolygonShape[];
    } else {
        throw "Could not retrieve shapes";
    };
}
