const express = require("express");
const router = express.Router();

const { complete_verification } = require("../../controllers");
router.post("/NIN", complete_verification.verify_NIN);
router.post("/phonenumber", complete_verification.verify_NIN);
router.post("/BVN", complete_verification.verify_NIN);
router.post("/verify_email", complete_verification.verify_email);
router.post("/resend_verification", complete_verification.resend_verification);

module.exports = router;
