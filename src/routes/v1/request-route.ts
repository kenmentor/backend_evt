import { Router } from "express";
import { request_controller } from "../../controllers";
import { request_middleware } from "../../middle-ware";

const router = Router();

router.post(
  "/",
  request_middleware.booking_create,
  request_controller.create_request
);

router.get("/:id", request_controller.get_request_details);

router.get("/list/:userId", request_controller.get_all_request);

router.delete("/:requestId", request_controller.delete_request);

router.put("/:requestId", request_controller.update_request);

export default router;
