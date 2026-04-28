import { Request, Response, NextFunction } from "express";
import { response } from "../utility";
import jwt from "jsonwebtoken";
import multer from "multer";
import dotenv from "dotenv";
dotenv.config();

const storage = multer.memoryStorage();
const upload = multer({ storage });

function signup(req: Request, res: Response, next: NextFunction) {
  const body = req.body;
  if (!body.email) {
    const badResponse: any = response.badResponse;
    badResponse.message = "email is required ";
    badResponse.status = 400;
    return res.json(badResponse);
  }
  if (!body.password) {
    const badResponse: any = response.badResponse;
    badResponse.message = "password is required ";
    badResponse.status = 400;
    return res.json(badResponse);
  }
  next();
}

function login_user(req: Request, res: Response, next: NextFunction) {
  const { body } = req;

  if (!body.email) {
    const badResponse: any = response.badResponse;
    badResponse.message = "email is required ";
    badResponse.status = 400;
    console.log(1, body);
    return res.status(400).json(badResponse);
  }
  console.log(2, body);
  if (!body.password) {
    const badResponse: any = response.badResponse;
    badResponse.message = "Password is required ";
    badResponse.status = 400;
    console.log(3, body);
    return res.status(400).json(badResponse);
  }
  console.log(4, body);
  next();
}

export default {
  signup,
  login_user,
};
