import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { RideRoutes } from "../modules/ride/ride.route";
import { DriverRoute } from "../modules/driver/driver.route";
import { RatingRouts } from "../modules/rating/rating.routes";

export const router = Router();

const modulesRoutes = [
    {
        path  : "/users",
        route : UserRoutes
    },
    {
        path : "/auth",
        route : AuthRoutes
    },
    {
        path : "/ride",
        route : RideRoutes
    },
    {
        path : "/driver",
        route : DriverRoute
    },
    {
        path : "/rating",
        route : RatingRouts
    }
]

modulesRoutes.forEach((route) => {
    router.use(route.path, route.route)
})