import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { RideRoutes } from "../modules/ride/ride.route";
import { DriverRoute } from "../modules/driver/driver.route";
import { RatingRouts } from "../modules/rating/rating.routes";
import { OtpRoutes } from "../modules/otp/otp.routes";
import { PaymentRoute } from "../modules/payment/payment.route";
import { ContactRoute } from "../modules/contact/contact.route";

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
    },
    {
        path : "/otp",
        route : OtpRoutes
    },
    {
        path : "/v1/payment",
        route : PaymentRoute
    },
    {
        path : "/contact",
        route : ContactRoute
    }
]

modulesRoutes.forEach((route) => {
    router.use(route.path, route.route)
})