import { Router } from "express";
import { RideController } from "./ride.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";

const router = Router();

router.post("/request", checkAuth(Role.RIDER), RideController.createRideRequest);
// TODO : Role Base Token Create auth(Role.DIVER, ROLE.ADMIN)
router.patch("/:id/status", checkAuth(Role.DIVER) ,RideController.updateRideStatus);
router.get("/me", RideController.getMyRides);

export const RideRoutes = router;