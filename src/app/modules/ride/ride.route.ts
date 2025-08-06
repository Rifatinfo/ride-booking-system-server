import { Router } from "express";
import { RideController } from "./ride.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";

const router = Router();

router.post("/request", checkAuth(Role.RIDER), RideController.createRideRequest);
router.patch("/:id/status", checkAuth(Role.DRIVER) ,RideController.updateRideStatus);
router.patch("/:id/cancel", checkAuth(Role.RIDER) ,RideController.cancelRiderByRider);
router.get("/all-history", checkAuth(Role.RIDER, Role.SUPER_ADMIN, Role.ADMIN), RideController.getMyRides);
//  Get Ride History (Completed + Canceled) for Rider
// routes/ride.route.ts
router.get('/cancel-complete-history', checkAuth(Role.RIDER), RideController.getRiderRideHistory);


export const RideRoutes = router;