const { userCookieVerify } = require("../utility")
const { user_service } = require("../service")

async function check_Auth(req, res) {
  try {
    const decoded = userCookieVerify(req, res)
    
    // If token is invalid or missing, return unauthenticated
    if (!decoded || !decoded.id) {
      return { user: null, authenticated: false }
    }
    
    // Fetch user data from database
    const user = await user_service.get_user(decoded.id)
    
    if (user) {
      return { user, authenticated: true }
    }
    return { user: null, authenticated: false }

  } catch (error) {
    return { user: null, authenticated: false }
  }
}
module.exports = {
  check_Auth: check_Auth
}