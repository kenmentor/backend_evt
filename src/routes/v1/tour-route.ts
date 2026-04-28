import { Router } from "express";
import { tour_controller } from "../../controllers";

const router = Router();

router.post("/", tour_controller.createTour);

router.get("/:id", tour_controller.getTourById);

router.get("/guest/:guestId", tour_controller.getToursByGuest);

router.get("/landlord/:hostId", tour_controller.getToursByHost);

router.get("/agent/:agentId", tour_controller.getToursByAgent);

router.get("/property/:propertyId", tour_controller.getToursByProperty);

router.put("/:id/status", tour_controller.updateTourStatus);

router.put("/:id/cancel", tour_controller.cancelTour);

router.put("/:id/complete", tour_controller.completeTour);

router.delete("/:id", tour_controller.deleteTour);

export default router;
