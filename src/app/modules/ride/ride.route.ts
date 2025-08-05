import { Router } from "express";
import { RideController } from "./ride.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";

const router = Router();

router.post("/request", checkAuth(Role.RIDER), RideController.createRideRequest);
router.patch("/:id/status", checkAuth(Role.DRIVER) ,RideController.updateRideStatus);
router.patch("/:id/cancel", checkAuth(Role.RIDER) ,RideController.cancelRiderByRider);
router.get("/me", checkAuth(Role.RIDER), RideController.getMyRides);

export const RideRoutes = router;