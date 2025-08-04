import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { RideRoutes } from "../modules/ride/ride.route";

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
    }
]

modulesRoutes.forEach((route) => {
    router.use(route.path, route.route)
})