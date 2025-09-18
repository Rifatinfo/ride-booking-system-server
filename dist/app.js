"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const routes_1 = require("./app/routes");
const errorHandler_middleware_1 = require("./app/middlewares/errorHandler.middleware");
const notFound_1 = require("./app/middlewares/notFound");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    // origin: envVars.FRONTEND_URL,
    origin: ['https://ride-booking-clients.vercel.app'],
    credentials: true
}));
app.use((0, cookie_parser_1.default)());
app.use("/api", routes_1.router);
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to Ride Booking System Server"
    });
});
app.use(errorHandler_middleware_1.globalErrorHandler);
app.use(notFound_1.notFound);
exports.default = app;
