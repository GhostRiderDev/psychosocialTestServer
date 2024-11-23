// Define your validation middleware function
function validateResponse(req, res, next) {
    // Check if the response has already been sent
    if (res.headersSent) {
        return next();
    }

    // Assuming res.data is where your response data is stored
    const responseData = res.data;

    // Your validation logic goes here
    // For example, let's assume you want to ensure the response has a certain property
    if (!responseData.hasOwnProperty('someProperty')) {
        // If the property is missing, send an error response
        return res.status(400).json({ error: 'Response validation failed: Missing required property "someProperty"' });
    }

    // If validation passes, continue to the next middleware or route handler
    next();
}

module.exports = validateResponse;