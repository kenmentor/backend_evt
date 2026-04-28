import { Request, Response, NextFunction } from "express";
import { response, userCookieVerify } from "../utility";

function booking_create(req: Request, res: Response, next: NextFunction) {
  const { body } = req;

  userCookieVerify(req, res);
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
  if (!body.paymentId) {
    const badResponse: any = response.badResponse;
    badResponse.message = "paymentId is required ";
    badResponse.status = 500;
    return res.json(badResponse);
  }
  if (!body.checkIn) {
    const badResponse: any = response.badResponse;
    badResponse.message = "checkIn is required ";
    badResponse.status = 500;
    return res.json(badResponse);
  }
  if (!body.checkOut) {
    const badResponse: any = response.badResponse;
    badResponse.message = "checkOut is required ";
    badResponse.status = 500;
    return res.json(badResponse);
  }

  next();
}

function CookieValidity(req: Request, res: Response, next: NextFunction) {
  const value = userCookieVerify(req, res);

  if (value) { next(); }
}

export default {
  booking_create,
  CookieValidity,
};
