const goodResponse = (data = [], message = "success", status = 200) => {
    const safeStatus = typeof status === "number" && status > 0 && status < 600 ? status : 200;
    return {
        data: data ?? [],
        error: {},
        status: safeStatus,
        message: String(message || "success"),
        ok: true
    };
};

const badResponse = (message = "Something went wrong", status = 500, error = {}) => {
    const safeStatus = typeof status === "number" && status > 0 && status < 600 ? status : 500;
    let errorObj = {};
    try {
        if (error && typeof error === "object") {
            errorObj = { message: String(error.message || ""), ...error };
        }
    } catch (e) {
        errorObj = { message: "Unknown error" };
    }
    return {
        data: [],
        error: errorObj,
        status: safeStatus,
        message: String(message || "Something went wrong"),
        ok: false
    };
};

module.exports = {
    goodResponse,
    badResponse
}