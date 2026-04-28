import { Request, Response } from "express";
import { feedback_service } from "../service";
import { response } from "../utility";
const { goodResponse, badResponse } = response;

async function create_feedback(req: Request, res: Response) {
    try {
        const { message, userId } = req.body;
        await feedback_service.create_feedback({ userId: userId, message: message });
        return res.json(goodResponse([], "Thanks for your feedback"));
    } catch (error: any) {
        return res.status(500).json(badResponse(error.message, 500, error));
    }
}
async function get_feedback(req: Request, res: Response) {
    try {
        const data = await feedback_service.get_feedback();
        return res.json(goodResponse(data));
    } catch (error: any) {
        return res.status(500).json(badResponse(error.message, 500, error));
    }
}
export {
    create_feedback,
    get_feedback,
};
