
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

function httpGetSync(endpoint: string, payload: any) : Response
{
    var xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint, false); // false for synchronous request
    xhr.setRequestHeader("Content-Type", 'application/json');
    xhr.setRequestHeader("Accept", 'application/json');
    xhr.send(payload);

    console.log(`readyState=${xhr.readyState} && status=${xhr.status} && responseText=${xhr.responseText}`);
    if (xhr.readyState === 4 && xhr.status === 200) {
        return JSON.parse(xhr.responseText);
    } else {

        return {'h3resolution': payload.h3resolution, 'h3indices': {}};
    };
}
  
export const getCountPerHexaSync = (endpoint: string, h3resolution: number, h3indices: [String]) : Response => {
    const postData = {
        "h3resolution": h3resolution,
        "h3indices": h3indices
    };

    var resp = httpGetSync(endpoint, JSON.stringify(postData));
    return resp;
}
