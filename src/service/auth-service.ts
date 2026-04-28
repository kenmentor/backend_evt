import { userCookieVerify } from "../utility";
import * as user_service from "./user-service";

export async function check_Auth(req: any, res: any) {
  try {
    const decoded = userCookieVerify(req, res);

    if (!decoded || !decoded.id) {
      return { user: null, authenticated: false };
    }

    const user = await user_service.get_user(decoded.id);

    if (user) {
      return { user, authenticated: true };
    }
    return { user: null, authenticated: false };
  } catch (error) {
    return { user: null, authenticated: false };
  }
}
