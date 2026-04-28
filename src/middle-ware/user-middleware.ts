import { Request, Response, NextFunction } from "express";
import { response, userCookieVerify } from "../utility";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

function user_update(req: Request, res: Response, next: NextFunction) {
  userCookieVerify(req, req as any);
  const { body } = req;
  if (!body.phoneNumber) {
    const badResponse: any = response.badResponse;
    badResponse.message = "phoneNumber is required ";
    badResponse.status = 500;
    return res.json(badResponse);
  }
  if (!body.email) {
    const badResponse: any = response.badResponse;
    badResponse.message = "email is required ";
    badResponse.status = 500;

    return res.json(badResponse);
  }
  next();
}

function user_create(req: Request, res: Response, next: NextFunction) {
  const { body } = req;
  if (!body.phoneNumber) {
    const badResponse: any = response.badResponse;
    badResponse.message = "phoneNumber is required ";
    badResponse.status = 500;
    return res.status(500).json(badResponse);
  }
  if (!body.userName) {
    const badResponse: any = response.badResponse;
    badResponse.message = "userName is required ";
    badResponse.status = 500;
    return res.status(500).json(badResponse);
  }
  if (!body.email) {
    const badResponse: any = response.badResponse;
    badResponse.message = "email is required ";
    badResponse.status = 400;

    return res.status(500).json(badResponse);
  }
  if (!body.password) {
    const badResponse: any = response.badResponse;
    badResponse.message = "phoneNumber is required ";
    badResponse.status = 500;
    return res.json(badResponse);
  }
  next();
}

function user_delete(req: Request, res: Response, next: NextFunction) {
  try {
  userCookieVerify(req, req as any);

    next();
  } catch (error) {
    const Response: any = response.badResponse;
    return res.status(500).json((Response.message = "invalid token "));
  }
}

function CookieValidity(req: Request, res: Response, next: NextFunction) {
  userCookieVerify(req, res);
  next();
}

export default {
  user_update,
  user_delete,
  user_create,
  CookieValidity,
};
