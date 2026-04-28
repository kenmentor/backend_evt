import { Request, Response, NextFunction } from "express";
import { response } from "../utility";

function booking_create(req: Request, res: Response, next: NextFunction) {
  const { body } = req;
  if (!body.hostId) {
    const badResponse: any = response.badResponse;
    badResponse.message = "hostId is required ";
    badResponse.status = 500;
    return res.json(badResponse);
  }
  if (!body.guestId) {
    const badResponse: any = response.badResponse;
    badResponse.message = "guestId is required ";
    badResponse.status = 500;
    return res.json(badResponse);
  }
  if (!body.houseId) {
    const badResponse: any = response.badResponse;
    badResponse.message = "houseId is required ";
    badResponse.status = 500;
    return res.json(badResponse);
  }

  next();
}

export default {
  booking_create,
};
