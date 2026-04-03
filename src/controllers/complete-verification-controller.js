const { verification_service } = require("../service");
const { response } = require("../utility");
const { goodResponse, badResponse } = response;
const { generateTokenAndSetCookie } = require("../utility");

function verify_NIN(req, res) { }


function verify_phonenumber(req, res) { }
function verify_user() { }
async function verify_email(req, res) {
    const { code } = req.body
    try {
        const data = await verification_service.verify_email(code)
        if (!data) {
            return res.status(400).json(badResponse("Invalid or expired verification code", 400))
        }
        
        // If already verified, still return success but don't login again
        if (data.alreadyVerified) {
            return res.json(goodResponse(data, "Email already verified"))
        }
        
        // Generate token and set cookie to auto-login
        generateTokenAndSetCookie(res, data._id);
        
        // Remove sensitive data before sending
        const safeUser = {
            _id: data._id,
            email: data.email,
            userName: data.userName,
            phoneNumber: data.phoneNumber,
            role: data.role,
            verifiedEmail: data.verifiedEmail
        };
        
        return res.json(goodResponse({ user: safeUser }, "Email verification successful. You are now logged in!"))

    } catch (error) {
        return res.status(500).json(badResponse(error.message, 500, error))
    }
}

async function resend_verification(req, res) {
    const { email } = req.body
    
    if (!email) {
        return res.status(400).json(badResponse("Email is required", 400))
    }
    
    try {
        const data = await verification_service.resend_verification(email)
        return res.json(goodResponse(data, "Verification code sent"))
    } catch (error) {
        return res.status(500).json(badResponse(error.message, 500, error))
    }
}

module.exports = { verify_NIN, verify_user, verify_phonenumber, verify_email, resend_verification };
