const express = require("express");
const router = express.Router();
const { house_controller } = require("../../controllers");
const house_upload = require("../../middle-ware/house-midleware");

router.get("/detail/:id", house_controller.get_house_detail);

router.get("/", house_controller.get_house);

router.put("/", house_controller.update_house_view);
router.put("/:id", house_controller.update_house);

router.post("/", house_upload, house_controller.upload_house);

module.exports = router;
