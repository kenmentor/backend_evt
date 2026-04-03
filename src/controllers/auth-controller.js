const { response } = require("../utility")
const { auth_service } = require("../service")
const { goodResponse, badResponse } = response
async function auth_check(req, res) {
    try {
        const data = await auth_service.check_Auth(req, res)
        return res.json(goodResponse(data))
    } catch (error) {
        return res.status(500).json(badResponse(error.message, 500, error))
    }


}



module.exports = {
    auth_check
}