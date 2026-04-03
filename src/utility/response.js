const goodResponse = (data = [], message = "success", status = 200) => ({
    data,
    error: {},
    status,
    message,
    ok: true
});

const badResponse = (message = "Something went wrong", status = 500, error = {}) => ({
    data: [],
    error,
    status,
    message,
    ok: false
});

module.exports = {
    goodResponse,
    badResponse
}