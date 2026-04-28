import jwt from "jsonwebtoken"
import { default as next } from "next"
import { Request, Response } from "express"
import * as dotenv from "dotenv"
dotenv.config()
const jwt_api_key = process.env.JWT_API_KEY as string

function verifyJwtToken (req: Request, res: Response){
    console.log(jwt_api_key)
    const token = req.header("Authorization")
    if (!token){
        res.status(404).json({erro:"no json "})
    }
    try{
        const decode = jwt.verify( token , jwt_api_key )
        req.user = decode as { id: string; email?: string; role?: string; }
        ;(next as any)()
    }catch(err){
        res.status(500).json({erro:"token not valid "})
    }


}
export {
    verifyJwtToken
}
