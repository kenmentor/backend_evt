import { Router } from "express";
import { demand_controller } from "../../controllers";

const router = Router();

router.get("/detail/:id", demand_controller.get_demand_detail);

router.get("/", demand_controller.get_demand);

router.put("/", demand_controller.update_demand_view);
router.put("/:id", demand_controller.update_demand);

router.post("/", demand_controller.upload_demand);

export default router;
