"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverController = void 0;
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const http_status_codes_1 = require("http-status-codes");
const ride_model_1 = require("../ride/ride.model");
const sendResponse_1 = require("../../middlewares/sendResponse");
const getDriverEarning = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const user = req.user;
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, "User not authenticated");
    }
    if (user.role !== "DRIVER") {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, "User not authenticated");
    }
    const rides = yield ride_model_1.Ride.find({
        driverId: user.userId,
        status: "COMPLETED"
    }).select("fare driverEarning pickupLocation destinationLocation completedAt").populate("riderId", "name email pickupLocation destinationLocation");
    const totalEarnings = rides.reduce((sum, ride) => sum + ride.driverEarning, 0);
    // start to day 
    const today = new Date();
    const starOfDay = new Date(today);
    starOfDay.setHours(0, 0, 0, 0);
    // start of week 
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    // start of month 
    const startOfMonth = new Date(today.getFullYear() - today.getDate(), 1);
    // earning Daily 
    const daily = yield ride_model_1.Ride.aggregate([
        {
            $match: {
                driverId: user.userId,
                status: "COMPLETED",
                completedAt: { $gte: starOfDay }
            },
        },
        { $group: { _id: null, total: { $sum: "$driverEarning" } } }
    ]);
    // earning weekly 
    const week = yield ride_model_1.Ride.aggregate([
        {
            $match: {
                driverId: user.userId,
                status: "COMPLETED",
                completedAt: { $gte: startOfWeek }
            },
        },
        { $group: { _id: null, total: { $sum: "$driverEarning" } } }
    ]);
    // earning monthly  
    const month = yield ride_model_1.Ride.aggregate([
        {
            $match: {
                driverId: user.userId,
                status: "COMPLETED",
                completedAt: { $gte: startOfMonth }
            },
        },
        { $group: { _id: null, total: { $sum: "$driverEarning" } } }
    ]);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: "My History fetched Successfully",
        data: {
            totalRides: rides.length,
            totalEarnings,
            daily: ((_a = daily[0]) === null || _a === void 0 ? void 0 : _a.total) || 0,
            weekly: ((_b = daily[0]) === null || _b === void 0 ? void 0 : _b.total) || 0,
            monthly: ((_c = daily[0]) === null || _c === void 0 ? void 0 : _c.total) || 0,
            rides,
        },
    });
});
exports.DriverController = {
    getDriverEarning
};
