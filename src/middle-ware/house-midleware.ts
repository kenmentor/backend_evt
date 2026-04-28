import { Request, Response, NextFunction } from "express";
import { response, userCookieVerify } from "../utility";
import jwt from "jsonwebtoken";
import multer from "multer";
import { goodResponse } from "../utility/response";
import dotenv from "dotenv";
dotenv.config();

const storage = multer.memoryStorage();
const upload = multer({ storage });

function house_upload(req: Request, res: Response, next: NextFunction) {
  upload.fields([
    { name: "files", maxCount: 10 },
    { name: "thumbnail", maxCount: 1 },
    { name: "video", maxCount: 1 }
  ])(req, res, function (err: any) {
    if (err) {
      console.log("Multer error:", err);
      (goodResponse as any).message = err.message;
      return res.status(400).json(goodResponse);
    }

    try {
      let token = req.cookies?.token;
      
      if (!token && req.headers.authorization) {
        const authHeader = req.headers.authorization;
        if (authHeader.startsWith("Bearer ")) {
          token = authHeader.substring(7);
        }
      }

      if (!token) {
        console.log("No token found in cookies or headers");
        (goodResponse as any).message = "Authentication required";
        return res.status(401).json(goodResponse);
      }

      const decoded = jwt.verify(token, process.env.JWT_API_KEY as string) as any;
      console.log("Token decoded:", decoded);
      
      (req as any).user = { 
        id: decoded.id || decoded.userId || decoded._id || decoded.sub 
      };
      console.log("User authenticated, ID:", (req as any).user.id);
      
      next();
    } catch (error: any) {
      console.error("Verification Error:", error.message);
      (goodResponse as any).message = error.message || "Authentication failed";
      return res.status(401).json(goodResponse);
    }
  });
}

function CookieValidity(req: Request, res: Response, next: NextFunction) {
  userCookieVerify(req, res);
  next();
}

export { CookieValidity };
export default house_upload;
