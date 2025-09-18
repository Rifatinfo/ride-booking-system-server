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
exports.RatingRoute = void 0;
const ride_model_1 = require("../ride/ride.model");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const http_status_codes_1 = require("http-status-codes");
const rating_model_1 = require("./rating.model");
const user_model_1 = require("../user/user.model");
const sendResponse_1 = require("../../middlewares/sendResponse");
const createRating = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { rideId, rating, feedback } = req.body;
    const riderId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    // Validate ride
    const ride = yield ride_model_1.Ride.findById(rideId);
    console.log(ride);
    console.log("rideId type:", typeof rideId, rideId);
    if (!ride) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Ride does not exist");
    }
    if (ride.status !== "COMPLETED") {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "You can only rate completed rides");
    }
    if (ride.riderId.toString() !== riderId) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, "You are not allowed to rate this ride");
    }
    // Prevent duplicate rating
    const existing = yield rating_model_1.Rating.findOne({ rideId });
    if (existing) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.CONFLICT, "You already rated this ride");
    }
    // Validate rating
    if (typeof rating !== "number" || rating < 1 || rating > 5) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Rating must be a number between 1 and 5");
    }
    // Validate feedback
    if (!feedback || feedback.trim() === "") {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Feedback is required");
    }
    // Create the new rating
    const newRating = yield rating_model_1.Rating.create({
        rideId,
        riderId,
        driverId: ride.driverId,
        rating,
        feedback
    });
    // Recalculate driver's average rating
    const ratings = yield rating_model_1.Rating.find({ driverId: ride.driverId });
    const avgRating = ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length;
    // Update driver's averageRating
    yield user_model_1.User.findByIdAndUpdate(ride.driverId, { averageRating: avgRating });
    // Send response
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        message: "Rating added successfully",
        data: newRating
    });
});
exports.RatingRoute = {
    createRating
};
