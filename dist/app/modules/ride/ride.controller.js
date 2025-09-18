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
exports.RideController = void 0;
const catchAsync_1 = require("../../middlewares/catchAsync");
const ride_service_1 = require("./ride.service");
const http_status_codes_1 = require("http-status-codes");
const sendResponse_1 = require("../../middlewares/sendResponse");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const ride_model_1 = require("./ride.model");
const user_model_1 = require("../user/user.model");
const createRideRequest = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (!user || !user.userId) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Not Found User");
    }
    const { ride, payment } = yield ride_service_1.RideService.requestRide(req.body, user.userId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        message: "Ride Request In Successfully",
        data: {
            ride, payment
        }
    });
}));
const getAllRiderRequest = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const rides = yield ride_service_1.RideService.getAllRiderRequest();
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        message: "Ride Request In Successfully",
        data: rides
    });
}));
const getSingleRiderRequest = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const riderId = req.user;
    if (!riderId) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Not Found Rider Request");
    }
    console.log(riderId);
    const rides = yield ride_model_1.Ride.findOne({
        riderId: riderId.userId, // the logged-in rider
        status: { $in: ["REQUESTED", "ACCEPTED", "PICKED_UP", "IN_TRANSIT", "COMPLETED", "CANCELED"] },
    })
        .sort({ requestedAt: -1 })
        .lean();
    console.log(rides);
    // fetch driver info manually 
    let driverInfo = null;
    if (rides === null || rides === void 0 ? void 0 : rides.driverId) {
        driverInfo = yield user_model_1.User.findById(rides.driverId)
            .lean();
    }
    const rideWithDriver = Object.assign(Object.assign({}, rides), { driver: driverInfo });
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: "Ride Request In Successfully",
        data: rideWithDriver
    });
}));
const getCompletedRides = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const completedRides = yield ride_service_1.RideService.completedRides();
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        message: "Ride Request In Successfully",
        data: completedRides.data,
        meta: completedRides.meta
    });
}));
const updateRideStatus = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const riderId = req.params.id;
    const { status } = req.body;
    const user = req.user;
    console.log(user, riderId);
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Not Found User");
    }
    const result = yield ride_service_1.RideService.updateRideStatus(riderId, status, user);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: "Ride Status Update Successfully",
        data: result,
    });
}));
const cancelRiderByRider = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const riderId = req.params.id;
    const user = req.user;
    console.log(user);
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Not Found User");
    }
    const ride = yield ride_service_1.RideService.updateRideStatus(riderId, "CANCEL_BY_RIDER", user);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: "Ride Canceled In Successfully by rider",
        data: ride
    });
}));
const getMyRides = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (!user || !user.userId) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, "User not authenticated");
    }
    console.log(user.userId);
    const myRides = yield ride_service_1.RideService.getRidesByRiderId(user.userId);
    // const myRides = await Ride.find({ riderId: user._id });
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: "My History fetched Successfully",
        data: myRides,
    });
}));
const getRiderRideHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    console.log(user);
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, "User not authenticated");
    }
    const rideHistory = yield ride_model_1.Ride.find({
        riderId: user.userId,
        status: { $in: ["COMPLETED", "CANCEL_BY_DRIVER", "CANCEL_BY_RIDER"] }
    }).sort({ requestedAt: -1 });
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: "Ride History (completed and canceled) fetched Successfully",
        data: rideHistory,
    });
});
const rideDetailsController = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const ride = yield ride_service_1.RideService.getRideById(id);
    if (!ride) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Ride not found");
    }
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: "Ride Details fetched successfully",
        data: ride,
    });
}));
const getAnalytics = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield ride_service_1.RideService.getAnalytics();
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: "Analytics fetched successfully",
        data: data,
    });
}));
exports.RideController = {
    createRideRequest,
    updateRideStatus,
    getMyRides,
    cancelRiderByRider,
    getRiderRideHistory,
    getCompletedRides,
    getAnalytics,
    getAllRiderRequest,
    rideDetailsController,
    getSingleRiderRequest
};
