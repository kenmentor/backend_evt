import { Router } from "express";
import { complete_verification } from "../../controllers";

const router = Router();

router.post("/NIN", complete_verification.verify_NIN);
router.post("/phonenumber", complete_verification.verify_NIN);
router.post("/BVN", complete_verification.verify_NIN);
router.post("/verify_email", complete_verification.verify_email);
router.post("/resend_verification", complete_verification.resend_verification);

export default router;
