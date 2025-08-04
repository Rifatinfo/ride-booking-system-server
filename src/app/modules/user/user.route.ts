import {  Router } from "express";
import { UserController } from "./user.controller";
import { Role } from "./user.interface";
import { checkAuth } from "../../middlewares/checkAuth";
const router = Router();

router.post("/register", UserController.createUser);
router.get("/all-users", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserController.getAllUser);


export const UserRoutes = router;