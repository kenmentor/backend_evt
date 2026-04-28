import { createTransport } from "nodemailer"
import * as dotenv from "dotenv"
dotenv.config()
const EMAIL_PASS = process.env.EMAIL_PASS
const EMAIL = process.env.EMAIL


const client = createTransport({
    service: "gmail",
    auth: { user: EMAIL, pass: EMAIL_PASS }
})
const sender = EMAIL

export {
    sender,
    client,
}
