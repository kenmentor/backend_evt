import { Request, Response } from "express";
import { verification_service } from "../service";
import { response } from "../utility";
const { goodResponse, badResponse } = response;
import { generateTokenAndSetCookie } from "../utility";

function verify_NIN(req: Request, res: Response) { }

function verify_phonenumber(req: Request, res: Response) { }
function verify_user() { }
async function verify_email(req: Request, res: Response) {
    const { code } = req.body;
    try {
        const data = await verification_service.verify_email(code);
        if (!data) {
            return res.status(400).json(badResponse("Invalid or expired verification code", 400));
        }

        if (data.alreadyVerified) {
            return res.json(goodResponse(data, "Email already verified"));
        }

        generateTokenAndSetCookie(res, data.userId);

        const safeUser = {
            _id: data.userId,
            email: data.email,
            userName: data.userName,
            phoneNumber: data.phoneNumber,
            role: data.role,
            verifiedEmail: data.verifiedEmail
        };

        return res.json(goodResponse({ user: safeUser }, "Email verification successful. You are now logged in!"));

    } catch (error: any) {
        return res.status(500).json(badResponse(error.message, 500, error));
    }
}

async function resend_verification(req: Request, res: Response) {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json(badResponse("Email is required", 400));
    }

    try {
        const data = await verification_service.resend_verification(email);
        return res.json(goodResponse(data, "Verification code sent"));
    } catch (error: any) {
        return res.status(500).json(badResponse(error.message, 500, error));
    }
}

export { verify_NIN, verify_user, verify_phonenumber, verify_email, resend_verification };
