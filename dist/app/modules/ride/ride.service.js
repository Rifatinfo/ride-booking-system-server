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
exports.RideService = void 0;
const http_status_codes_1 = require("http-status-codes");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const ride_model_1 = require("./ride.model");
const user_model_1 = require("../user/user.model");
const geo_1 = require("../../utils/geo/geo");
const payment_model_1 = require("../payment/payment.model");
const payment_interface_1 = require("../payment/payment.interface");
const sslCommerz_service_1 = require("../sslCommerz/sslCommerz.service");
const getTransactionId = () => {
    return `tran_${Date.now()}_${Math.floor(Math.random()) * 1000}`;
};
const requestRide = (payload, riderId) => __awaiter(void 0, void 0, void 0, function* () {
    const transactionId = getTransactionId();
    const session = yield ride_model_1.Ride.startSession();
    session.startTransaction();
    try {
        const { pickupLocation, destinationLocation } = payload;
        if (!pickupLocation || !destinationLocation) {
            throw new Error("Missing pickup or destination location");
        }
        // Check active ride first
        // const existingRide = await Ride.findOne({
        //     riderId,
        //     status: { $in: ["ACCEPTED", "PICKED_UP", "IN_TRANSIT"] },
        // }).session(session);
        // if (existingRide) {
        //     throw new AppError(StatusCodes.CONFLICT, "You already have an active ride");
        // }
        // Coordinates + fare
        const pickupCoords = yield (0, geo_1.getCoordinate)(pickupLocation);
        const destCoords = yield (0, geo_1.getCoordinate)(destinationLocation);
        const distance = yield (0, geo_1.getDistance)(pickupCoords, destCoords);
        const fare = (0, geo_1.calculate)(distance);
        const driverEarning = fare * 0.8;
        // Find driver
        const driver = yield user_model_1.User.findOne({
            role: "DRIVER",
            isAvailable: true,
            isBlocked: false,
            status: "APPROVED",
        }).session(session);
        if (!driver) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, "No available drivers");
        }
        // Create ride
        const ride = yield ride_model_1.Ride.create([
            Object.assign(Object.assign({}, payload), { riderId,
                pickupLocation,
                destinationLocation,
                fare,
                driverEarning, driverId: driver._id, status: "REQUESTED", requestedAt: new Date() }),
        ], { session });
        // Create payment
        const payment = yield payment_model_1.Payment.create([
            {
                ride: ride[0]._id,
                user: riderId,
                amount: fare,
                transactionId,
                paymentStatus: payment_interface_1.PAYMENT_STATUS.UNPAID,
            },
        ], { session });
        const updatedRide = yield ride_model_1.Ride.findByIdAndUpdate(ride[0]._id, { payment: payment[0]._id }, { new: true, runValidators: true, session })
            .populate("riderId", "name email")
            .populate("driverId", "name email")
            .populate("payment");
        // Fetch user Details 
        const user = yield user_model_1.User.findById(riderId).select("name email").session(session);
        if (!user) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, "Rider Not Found");
        }
        const userEmail = user.email;
        const userName = user.name;
        const sslPayload = {
            email: userEmail,
            name: userName,
            amount: fare,
            transactionId: transactionId
        };
        const sslPayment = yield sslCommerz_service_1.SSLService.sslPaymentInit(sslPayload);
        // Mark driver unavailable
        driver.isAvailable = false;
        yield driver.save({ session });
        yield session.commitTransaction();
        ride[0].payment = payment[0]._id;
        yield ride[0].save({ session });
        return { ride: updatedRide, payment: sslPayment.GatewayPageURL };
        // return { ride: updatedRide, payment: sslPayment };
    }
    catch (error) {
        yield session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
});
const getAllRiderRequest = () => __awaiter(void 0, void 0, void 0, function* () {
    const rides = yield ride_model_1.Ride.find({ "status": ["REQUESTED", "ACCEPTED", "PICKED", "IN_TRANSIT", "COMPLETED", "CANCEL_BY_DRIVER", "CANCEL_BY_RIDER"] }).sort({ requestedAt: -1 }).lean();
    console.log(rides);
    return rides;
});
const completedRides = () => __awaiter(void 0, void 0, void 0, function* () {
    const completedRides = yield ride_model_1.Ride.find({ status: "COMPLETED" });
    if (!completedRides.length) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "No Completed rides found");
    }
    const totalCompleted = yield ride_model_1.Ride.countDocuments();
    return {
        data: completedRides,
        meta: {
            total: totalCompleted
        }
    };
});
const updateRideStatus = (riderId, status, user) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const ride = yield ride_model_1.Ride.findById(riderId);
    console.log(riderId);
    if (!ride) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Ride Not Found");
    }
    // if (ride.cancelAttemptCount >= 15) {
    //     throw new AppError(403, 'You have reached the maximum number if cancel attempts .');
    // }
    ride.status = status;
    // Timestamp update 
    if (status === "ACCEPTED")
        ride.acceptedAt = new Date();
    if (status === "PICKED")
        ride.pickedUpAt = new Date();
    if (status === "COMPLETED")
        ride.completedAt = new Date();
    if (status === "CANCEL_BY_DRIVER")
        ride.canceledAt = new Date();
    /** If RIDER Cancels */
    console.log("ride.riderId:", ride.riderId.toString());
    console.log("user._id:", user.userId);
    console.log("Ride status before cancel:", ride.status);
    if (user.role === "RIDER") {
        if (((_a = ride.riderId) === null || _a === void 0 ? void 0 : _a.toString()) !== user.userId) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, `Unauthorized rider. Ride belongs to ${ride.riderId}, but you are ${user.userId}`);
        }
        if (ride.status === "CANCEL_BY_RIDER") {
            console.log("Ride is already canceled by rider");
        }
        else if (ride.status === "REQUESTED" || ride.status === "ACCEPTED" || ride.status === "PICKED" || ride.status === "IN_TRANSIT") {
            ride.status = "CANCEL_BY_RIDER";
            ride.canceledAt = new Date();
            ride.cancellationReason = "Cancel by rider";
        }
        else {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Cannot cancel this ride at it's current status");
        }
    }
    //  const existingDriverRide = await Ride.findOne({
    //     driverId: ride.driverId?.toString(),
    //     status: { $in: ['COMPLETED'] }
    // });
    // if (existingDriverRide) {
    //     throw new AppError(StatusCodes.CONFLICT, "You already have completed Ride");
    // }
    if (user.role === "DRIVER" && status === "ACCEPTED") {
        const existingActiveRide = yield ride_model_1.Ride.findOne({
            driverId: user._id,
            status: { $in: ["ACCEPTED", "PICKED", "IN_TRANSIT"] }
        });
        if (existingActiveRide) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.CONFLICT, "You already have an active ride . Complete or cancel it before accepting another");
        }
    }
    ride.acceptedAt = new Date();
    // Increase cancel attempt count 
    ride.cancelAttemptCount += 1;
    return yield ride.save();
});
// const getRidesByRiderId = async (riderId: string) => {
//     return Ride.find({ riderId }).sort({ createdAt: -1 })
// }
const getRidesByRiderId = (riderId, filters) => __awaiter(void 0, void 0, void 0, function* () {
    const query = { riderId };
    // filter by status 
    if (filters.status) {
        query.status = filters.status;
    }
    if (filters.startDate && filters.endDate) {
        query.createdAt = {
            $gte: new Date(filters.startDate),
            $lte: new Date(filters.endDate)
        };
    }
    // search by pickup or dropOff location 
    if (filters.search) {
        query.$or = [
            { pickupLocation: { $regex: filters.search, $options: "i" } },
            { destinationLocation: { $regex: filters.search, $options: "i" } },
        ];
    }
    return ride_model_1.Ride.find(query).sort({ createdAt: -1 }).lean();
});
const getRideById = (rideId) => __awaiter(void 0, void 0, void 0, function* () {
    return ride_model_1.Ride.findById(rideId);
});
const getAnalytics = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const totalRides = yield ride_model_1.Ride.countDocuments();
    const completedRides = yield ride_model_1.Ride.countDocuments({ status: "COMPLETED" });
    const canceledRides = yield ride_model_1.Ride.countDocuments({ status: { $in: ["CANCEL_BY_DRIVER", "CANCEL_BY_RIDER"] } });
    const ongoingRides = yield ride_model_1.Ride.countDocuments({
        status: {
            $in: ["ACCEPTED", "PICKED",
                "IN_TRANSIT"]
        }
    });
    console.log(totalRides, completedRides, canceledRides, ongoingRides);
    const totalRevenueData = yield ride_model_1.Ride.aggregate([
        { $match: { status: "COMPLETED" } },
        { $group: { _id: null, totalRevenue: { $sum: "$fare" }, averageFare: { $avg: "$fare" } } }
    ]);
    const topDrivers = yield ride_model_1.Ride.aggregate([
        { $match: { status: "COMPLETED" } },
        { $group: { _id: "$driverId", rides: { $sum: 1 } } },
        { $sort: { rides: -1 } },
        { $limit: 5 },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "driver"
            }
        },
        { $unwind: "$driver" },
        { $project: { driverName: "$driver.name", rides: 1 } },
    ]);
    const avgDriverRating = yield ride_model_1.Ride.aggregate([
        { $match: { status: "COMPLETED", rating: { $exists: true } } },
        { $group: { _id: null, avgRating: { $avg: "$rating" } } }
    ]);
    return {
        totalRides,
        completedRides,
        canceledRides,
        ongoingRides,
        totalRevenue: ((_a = totalRevenueData[0]) === null || _a === void 0 ? void 0 : _a.totalRevenue) || 0,
        averageFare: ((_b = totalRevenueData[0]) === null || _b === void 0 ? void 0 : _b.averageFare) || 0,
        topDrivers,
        avgDriverRating: ((_c = avgDriverRating[0]) === null || _c === void 0 ? void 0 : _c.avgRating) || 0
    };
});
exports.RideService = {
    requestRide,
    updateRideStatus,
    getRidesByRiderId,
    completedRides,
    getAnalytics,
    getAllRiderRequest,
    getRideById,
};
