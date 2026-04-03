const { feedback_service } = require("../service")
const { response } = require("../utility")
const { goodResponse, badResponse } = response

async function create_feedback(req, res) {
    try {
        const { message, userId } = req.body
        await feedback_service.create_feedback({ userId: userId, message: message })
        return res.json(goodResponse([], "Thanks for your feedback"))
    } catch (error) {
        return res.status(500).json(badResponse(error.message, 500, error))
    }
}
async function get_feedback(req, res) {
    try {
        const data = await feedback_service.get_feedback()
        return res.json(goodResponse(data))
    } catch (error) {
        return res.status(500).json(badResponse(error.message, 500, error))
    }
}
module.exports = {
    create_feedback,
    get_feedback,
}