
export const fetchCountPerHexaAsync = async (endpoint: string, h3resolution: number, h3indices: [string]) : Promise<Response> => {
    const queryPayload : QueryPayload = {
        "h3resolution": h3resolution,
        "h3indices": h3indices
    };

    const fetchPayload = {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
        },
        body: JSON.stringify(queryPayload),
    };

    try {
        var res = await fetch(endpoint, fetchPayload);
        const data = await res.json();
        return data;
    } catch (e) {
        console.log(e);
        var p = new Promise<Response> (() => {return {'h3resolution': h3resolution, 'h3indices': {}}; });
        return p;
    }
}

interface QueryPayload {
    h3resolution: number;
    h3indices: [string];
}

export interface ResponseIndice { [key: string]: number };
export interface Response {
    h3resolution: number;
    h3indices: ResponseIndice;
}

function httpGetSync(endpoint: string, queryPayload: QueryPayload) : Response
{
    var xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint, false); // false for synchronous request
    xhr.setRequestHeader("Content-Type", 'application/json');
    xhr.setRequestHeader("Accept", 'application/json');
    const pstr = JSON.stringify(queryPayload);
    xhr.send(pstr);

    console.log(`readyState=${xhr.readyState} && status=${xhr.status} && responseText=${xhr.responseText}`);
    if (xhr.readyState === 4 && xhr.status === 200) {
        return JSON.parse(xhr.responseText);
    } else {
        return {'h3resolution': queryPayload.h3resolution, 'h3indices': {}};
    };
}
  
export const getCountPerHexaSync = (endpoint: string, h3resolution: number, h3indices: [string]) : Response => {
    const queryPayload : QueryPayload = {
        "h3resolution": h3resolution,
        "h3indices": h3indices
    };

    var resp: Response;
    try {
        resp = httpGetSync(endpoint, queryPayload);
    } catch (e) {
        console.log(e);
        resp = {'h3resolution': queryPayload.h3resolution, 'h3indices': {}};
    }
    return resp;
}
