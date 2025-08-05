import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { DriverController } from "./driver.controller";
import { UserController } from "../user/user.controller";


const router = Router();

router.get("/earning", checkAuth(Role.DRIVER), DriverController.getDriverEarning);
router.patch("/set-availability", checkAuth(Role.DRIVER), UserController.setAvailability);

export const DriverRoute = router;