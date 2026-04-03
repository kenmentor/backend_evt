const jwt = require("jsonwebtoken")
require("dotenv").config()
module.exports = (req, res) => {
    try {
        const token = req.cookies.token
        if (!token) {
            return null
        }
        const decode = jwt.verify(token, process.env.JWT_API_KEY)
        if (!decode) {
            return null
        }
        return decode;
    }
    catch (error) {
        return null
    }
}