module.exports = {
    sendResponse: (res, responseCode, responseMessage, data) => {
        return res.json({responseCode, responseMessage, data})
    }
}