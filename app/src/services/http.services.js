
const http = {
    _POST,
    _GET
}

function _POST(_url, _data) {
    return fetch(_url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json'
        },
        body: _data
    }).then(handleResponse);
}

function _GET(_url) {
    return fetch(_url ,{
        method: 'GET'
    }).then(handleResponse);
}

function handleResponse(response) {
    return response.text().then(text => {
        const data = text && JSON.parse(text);
        if (!response.ok) {
            const error = (data && data.message) || response.statusText;
            return Promise.reject(error);
        }
        return data;
    });
}

export default http;