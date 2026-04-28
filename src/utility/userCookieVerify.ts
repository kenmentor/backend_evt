import jwt from "jsonwebtoken"
import { Request, Response } from "express"
import * as dotenv from "dotenv"
dotenv.config()

interface DecodedToken {
  id: string;
  email?: string;
  role?: string;
}

export default (req: Request, res: Response): DecodedToken | null => {
    try {
        const token = req.cookies.token
        if (!token) {
            return null
        }
        const decode = jwt.verify(token, process.env.JWT_API_KEY as string) as DecodedToken
        if (!decode) {
            return null
        }
        return decode;
    }
    catch (error) {
        return null
    }
}
