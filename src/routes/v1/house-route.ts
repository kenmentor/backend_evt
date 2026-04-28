import { Router } from "express";
import { house_controller } from "../../controllers";
import house_upload from "../../middle-ware/house-midleware";

const router = Router();

router.get("/detail/:id", house_controller.get_house_detail);

router.get("/", house_controller.get_house);

router.put("/", house_controller.update_house_view);
router.put("/:id", house_controller.update_house);

router.post("/", house_upload, house_controller.upload_house);

export default router;
