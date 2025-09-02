import { Router } from "express";
import { RideController } from "./ride.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";

const router = Router();

router.post("/request", checkAuth(Role.RIDER), RideController.createRideRequest);
router.get("/request", checkAuth(Role.DRIVER),RideController.getAllRiderRequest);
router.patch("/status/:id", checkAuth(Role.DRIVER) ,RideController.updateRideStatus);
router.patch("/:id/cancel", checkAuth(Role.RIDER) ,RideController.cancelRiderByRider);
router.get("/all-history", checkAuth(Role.RIDER), RideController.getMyRides);
router.get('/cancel-complete-history', checkAuth(Role.RIDER), RideController.getRiderRideHistory);
router.get('/complete', checkAuth(Role.RIDER), RideController.getCompletedRides);
router.get("/analytics", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), RideController.getAnalytics);


export const RideRoutes = router;