const express = require("express");
const router = express.Router();
const { demand_controller } = require("../../controllers");
// const multer = require("multer");
// const storage = multer.memoryStorage();
// const upload = multer({ storage });
const { demand_middleware, upload_molter } = require("../../middle-ware");

//v1/demand_deatail (for getting house details with id )
router.get("/detail/:id", demand_controller.get_demand_detail);

//v1/house/ (get list of houses)
router.get("/", demand_controller.get_demand);
// (update view per click )
router.put("/", demand_controller.update_demand_view);
router.put("/:id", demand_controller.update_demand);
//v1/upload  (upload files and it details)
router.post("/", demand_controller.upload_demand);

module.exports = router;
