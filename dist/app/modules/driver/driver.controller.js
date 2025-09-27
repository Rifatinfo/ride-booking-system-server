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
const mongoose_1 = __importDefault(require("mongoose"));
// const getDriverEarning = async (req: Request, res: Response) => {
//     const user = req.user;
//     if (!user) {
//         throw new AppError(StatusCodes.UNAUTHORIZED, "User not authenticated");
//     }
//     if (user.role !== "DRIVER") {
//         throw new AppError(StatusCodes.UNAUTHORIZED, "User not authenticated");
//     }
//     const rides = await Ride.find({
//         driverId: user.userId,
//         status: "COMPLETED"
//     }).select("fare driverEarning pickupLocation destinationLocation completedAt status").populate("riderId", "name email") 
//     const totalEarnings = rides.reduce((sum, ride) => sum + ride.driverEarning, 0);
//     // start to day 
//     const today = new Date();
//     const starOfDay = new Date(today);
//     starOfDay.setHours(0, 0, 0, 0);
//     // start of week 
//     const startOfWeek = new Date(today);
//     startOfWeek.setDate(today.getDate() - today.getDay());
//     startOfWeek.setHours(0, 0, 0, 0);
//     // start of month 
//     const startOfMonth = new Date(today.getFullYear() , today.getDate(), 1);
//     // earning Daily 
//     const daily = await Ride.aggregate([
//         {
//             $match: {
//                 driverId: user.userId,
//                 status: "COMPLETED",
//                 completedAt : {$gte : starOfDay}
//             },
//         },
//         {$group : {_id : null , total : {$sum : "$driverEarning"}}}
//     ]);
//     // earning weekly 
//     const week = await Ride.aggregate([
//         {
//             $match: {
//                 driverId: user.userId,
//                 status: "COMPLETED",
//                 completedAt : {$gte : startOfWeek}
//             },
//         },
//         {$group : {_id : null , total : {$sum : "$driverEarning"}}}
//     ]);
//     // earning monthly  
//     const month = await Ride.aggregate([
//         {
//             $match: {
//                 driverId: user.userId,
//                 status: "COMPLETED",
//                 completedAt : {$gte : startOfMonth}
//             },
//         },
//         {$group : {_id : null , total : {$sum : "$driverEarning"}}}
//     ]);
//     sendResponse(res, {
//         success: true,
//         statusCode: StatusCodes.OK,
//         message: "My History fetched Successfully",
//         data: {
//             totalRides: rides.length,
//             totalEarnings,
//             daily : daily[0]?.total || 0,
//             weekly : week[0]?.total || 0,
//             monthly : month[0]?.total || 0,
//             rides,
//         },
//     })
// }
const getDriverEarning = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, "User not authenticated");
    }
    if (user.role !== "DRIVER") {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, "Access denied");
    }
    const driverId = new mongoose_1.default.Types.ObjectId(user.userId);
    // ✅ Get all completed rides for this driver
    const rides = yield ride_model_1.Ride.find({
        driverId,
        status: "COMPLETED",
    })
        .select("fare driverEarning pickupLocation destinationLocation completedAt status")
        .populate("riderId", "name email");
    // ✅ Total earnings
    const totalEarnings = Math.round(rides.reduce((sum, ride) => sum + (ride.driverEarning || 0), 0));
    // ✅ Date ranges
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    // ✅ Helper for aggregation
    const getEarning = (startDate) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const result = yield ride_model_1.Ride.aggregate([
            {
                $match: {
                    driverId,
                    status: "COMPLETED",
                    completedAt: { $gte: startDate },
                },
            },
            { $group: { _id: null, total: { $sum: "$driverEarning" } } },
        ]);
        return ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
    });
    const daily = Math.round(yield getEarning(startOfDay));
    const weekly = Math.round(yield getEarning(startOfWeek));
    const monthly = Math.round(yield getEarning(startOfMonth));
    // ✅ Send response
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: "Driver earnings fetched successfully",
        data: {
            totalRides: rides.length,
            totalEarnings,
            daily,
            weekly,
            monthly,
            rides,
        },
    });
});
exports.DriverController = {
    getDriverEarning
};
