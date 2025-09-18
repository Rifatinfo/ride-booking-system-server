"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const user_route_1 = require("../modules/user/user.route");
const auth_route_1 = require("../modules/auth/auth.route");
const ride_route_1 = require("../modules/ride/ride.route");
const driver_route_1 = require("../modules/driver/driver.route");
const rating_routes_1 = require("../modules/rating/rating.routes");
const otp_routes_1 = require("../modules/otp/otp.routes");
const payment_route_1 = require("../modules/payment/payment.route");
exports.router = (0, express_1.Router)();
const modulesRoutes = [
    {
        path: "/users",
        route: user_route_1.UserRoutes
    },
    {
        path: "/auth",
        route: auth_route_1.AuthRoutes
    },
    {
        path: "/ride",
        route: ride_route_1.RideRoutes
    },
    {
        path: "/driver",
        route: driver_route_1.DriverRoute
    },
    {
        path: "/rating",
        route: rating_routes_1.RatingRouts
    },
    {
        path: "/otp",
        route: otp_routes_1.OtpRoutes
    },
    {
        path: "/payment",
        route: payment_route_1.PaymentRoute
    }
];
modulesRoutes.forEach((route) => {
    exports.router.use(route.path, route.route);
});
