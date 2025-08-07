import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { RatingRoute } from "./rating.controller";

const router = Router();
router.post('/driver', checkAuth(Role.RIDER), RatingRoute.createRating);

export const RatingRouts = router;