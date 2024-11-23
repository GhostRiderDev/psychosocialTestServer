const Response = (response = {}) => {
    const responseObject = {
        "status": response.status,
        "statusCode": response.statusCode,
        "message": response.message,
        "data": {}
    };

    if (response.type) {
        responseObject.data.type = response.type;
    }

    if (response.data) {
        responseObject.data.attributes = response.data;
    }

    if (response.token) {
        responseObject.data.token = response.token;
    }

    if (response.pagination) {
        responseObject.pagination = response.pagination;
    }

    if (response.type) {
        responseObject.data.type = response.type;
    }

    return responseObject;
}

module.exports = Response;