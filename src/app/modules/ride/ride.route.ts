import { Router } from "express";
import { RideController } from "./ride.controller";

const router = Router();

router.post("/request", RideController.createRideRequest);
// TODO : Role Base Token Create auth(Role.DIVER, ROLE.ADMIN)
router.patch("/:id/status", RideController.updateRideStatus);
router.get("/me", RideController.getMyRides);

export const RideRoutes = router;