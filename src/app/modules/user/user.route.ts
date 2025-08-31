import {  Router } from "express";
import { UserController } from "./user.controller";
import { Role } from "./user.interface";
import { checkAuth } from "../../middlewares/checkAuth";
const router = Router();

router.post("/register", UserController.createUser);
router.get("/me", checkAuth(...Object.values(Role)), UserController.getMe);
router.get("/all-users", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserController.getAllUser);
router.get("/all-drivers", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserController.getAllDrivers);
router.patch("/driver/:id/status", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserController.updateDriverStatus)
router.patch('/block/:id', checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserController.blockUser)
router.patch('/unblock/:id', checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserController.unblockUser);
// Update Location on Profile Edit By Driver 
router.patch("/:id/online", checkAuth(Role.DRIVER) ,UserController.goOnline);
export const UserRoutes = router;

