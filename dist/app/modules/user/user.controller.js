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
exports.UserController = void 0;
const user_service_1 = require("./user.service");
const http_status_codes_1 = require("http-status-codes");
const catchAsync_1 = require("../../middlewares/catchAsync");
const sendResponse_1 = require("../../middlewares/sendResponse");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const user_model_1 = require("./user.model");
const createUser = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_service_1.UserService.createUser(req.body);
    if (user.status === 'SUSPENDED') {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, "Your Account is Suspended");
    }
    if (user.isBlocked) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, "Your account is blocked.");
    }
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        message: "User Created Successfully",
        data: user
    });
}));
/* Update Location on Profile Edit By Driver  */
const goOnline = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    // const { location } = req.body;
    // if (!location || !location.coordinates || !Array.isArray(location.coordinates) || location.coordinates.length !== 2) {
    //     throw new AppError(StatusCodes.FORBIDDEN, "Location is required and must be [lng, lat]");
    // }
    const updatedDriver = yield user_model_1.User.findByIdAndUpdate(id, {
        isAvailable: true,
        // location,
    }, { new: true });
    if (!updatedDriver) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Driver not found");
    }
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: "Driver is now online and location updated",
        data: updatedDriver
    });
}));
const getAllUser = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield user_service_1.UserService.getAllUser();
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: "All User Retrieved Successfully",
        data: users.data,
        meta: users.meta
    });
}));
const getMe = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, "User Not Found");
    }
    const users = yield user_service_1.UserService.getMe(userId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: "User Information Retrieved Successfully",
        data: users.data,
    });
}));
const setAvailability = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { isAvailable } = req.body;
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, "User not authenticated");
    }
    if (typeof isAvailable !== 'boolean') {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "isAvailable must be a boolean");
    }
    const updatedDriver = yield user_model_1.User.findByIdAndUpdate(user.userId, { isAvailable }, { new: true });
    if (!updatedDriver) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Driver not Found");
    }
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: `Driver is Now ${isAvailable ? "Online" : "Offline"}`,
        data: updatedDriver
    });
});
// user.controller.ts
const getAllDrivers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const drivers = yield user_model_1.User.find({ role: "DRIVER" }).select("-password");
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: "All drivers fetched successfully",
        data: drivers
    });
});
const updateDriverStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { status } = req.body;
    if (!['APPROVED', 'SUSPENDED'].includes(status)) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Invalid Status");
    }
    const updateUser = yield user_model_1.User.findByIdAndUpdate(id, { status }, { new: true }).select("-password");
    if (!updateUser) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Driver Not Found");
    }
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: `Driver ${status.toLowerCase()} successfully`,
        data: updateUser
    });
});
const blockUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const user = yield user_model_1.User.findById(id);
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "User not Founded");
    }
    user.isBlocked = true;
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: `User has been blocked`,
        data: user
    });
    yield user.save();
});
const unblockUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const user = yield user_model_1.User.findById(id);
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "User not Founded");
    }
    user.isBlocked = false;
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: `User has been blocked`,
        data: user
    });
    yield user.save();
});
const changePasswordController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId; // from checkAuth
        if (!userId) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User not found");
        }
        const { oldPassword, newPassword, name, phone } = req.body;
        if (!oldPassword || !newPassword) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Both old and new passwords are required");
        }
        const result = yield user_service_1.UserService.changePasswordService(userId, oldPassword, newPassword, { name, phone });
        (0, sendResponse_1.sendResponse)(res, {
            success: true,
            statusCode: http_status_codes_1.StatusCodes.OK,
            message: "Password changed successfully",
            data: result, // return some safe info (not password)
        });
    }
    catch (error) {
        console.error("Change password error:", error);
        res.status(error.statusCode || http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message || "Something went wrong",
        });
    }
});
const allUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const allUsers = yield user_model_1.User.find().select("-password");
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: "All Users fetched successfully",
        data: allUsers
    });
});
const toggleBlocked = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params;
    const { isBlocked } = req.body;
    if (!userId) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, "User not authenticated");
    }
    if (typeof isBlocked !== 'boolean') {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "isBlocked must be a boolean");
    }
    const updatedUser = yield user_model_1.User.findByIdAndUpdate(userId.userId, { isBlocked }, { new: true });
    if (!updatedUser) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User not Found");
    }
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: `User ${isBlocked ? "blocked" : "unblocked"} successfully`,
        data: updatedUser
    });
});
const updateEmergencyPhoneController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //   const userId = req.user?.userId; // from checkAuth
    const userId = req.params;
    if (!userId) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User not found");
    }
    const { emergency_phone } = req.body;
    console.log(userId === null || userId === void 0 ? void 0 : userId.userId);
    const updatedUser = yield user_service_1.UserService.updateEmergencyPhone(userId.userId, emergency_phone);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: "Emergency phone updated successfully",
        data: updatedUser,
    });
});
const updateMe = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, "User Not Found");
    }
    const user = yield user_service_1.UserService.updateMe(userId, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: "Emergency phone updated successfully",
        data: user.data,
    });
}));
exports.UserController = {
    createUser,
    getAllUser,
    setAvailability,
    getAllDrivers,
    updateDriverStatus,
    blockUser,
    unblockUser,
    goOnline,
    getMe,
    changePasswordController,
    allUsers,
    toggleBlocked,
    updateEmergencyPhoneController,
    updateMe
};
