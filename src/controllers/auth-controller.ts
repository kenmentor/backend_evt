import { Request, Response } from "express";
import { response } from "../utility";
import { auth_service } from "../service";
const { goodResponse, badResponse } = response;
async function auth_check(req: Request, res: Response) {
    try {
        const data = await auth_service.check_Auth(req, res);
        return res.json(goodResponse(data));
    } catch (error: any) {
        return res.status(500).json(badResponse(error.message, 500, error));
    }


}

export {
    auth_check
};
