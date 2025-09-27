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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const http_status_codes_1 = require("http-status-codes");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const user_model_1 = require("./user.model");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const createUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { password, email, role, emergency_phone, address } = payload, rest = __rest(payload, ["password", "email", "role", "emergency_phone", "address"]);
    const isUserExist = yield user_model_1.User.findOne({ email }).select('+status');
    if (isUserExist) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User Already Exist");
    }
    const hashPassword = yield bcryptjs_1.default.hash(password, 10);
    const authProvider = {
        provider: "credential",
        providerId: email
    };
    const user = yield user_model_1.User.create(Object.assign({ email, password: hashPassword, auth: [authProvider], role: payload.role, emergency_phone,
        address }, rest));
    return user;
});
const getAllUser = () => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield user_model_1.User.find({});
    const totalUsers = yield user_model_1.User.countDocuments();
    return {
        data: users,
        meta: {
            total: totalUsers
        }
    };
});
const getMe = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield user_model_1.User.findById(userId).select("-password");
    return {
        data: users,
    };
});
const changePasswordService = (userId, oldPassword, newPassword, updates) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId).select("+password"); // include password
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User not found");
    }
    const isMatch = yield bcryptjs_1.default.compare(oldPassword, user.password);
    if (!isMatch) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Old password is incorrect");
    }
    // user.password = await bcrypt.hash(newPassword, 10);
    const updateData = {
        password: yield bcryptjs_1.default.hash(newPassword, 10),
    };
    if (updates.name)
        user.name = updates.name;
    if (updates.phone)
        user.phone = updates.phone;
    // await user.save();
    // // return safe info (not password)
    // return {
    //   _id: user._id,
    //   email: user.email,
    //   role: user.role,
    //   name: user.name,
    //   phone: user.phone
    // };
    const updatedUser = yield user_model_1.User.findByIdAndUpdate(userId, updateData, {
        new: true,
        ranValidators: true,
    }).select("-password");
    console.log(updatedUser);
    return updatedUser;
});
const updateEmergencyPhone = (userId, emergency_phone) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId);
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User is not Found");
    }
    const updatedUser = yield user_model_1.User.findByIdAndUpdate(userId, { emergency_phone }, { new: true });
    return updatedUser;
});
const updateMe = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const allowedFields = {
        name: payload.name,
        phone: payload.phone,
        address: payload.address,
        emergency_phone: payload.emergency_phone
    };
    const user = yield user_model_1.User.findByIdAndUpdate(userId, { $set: allowedFields }, { new: true, runValidators: true }).select("-password");
    return { data: user };
});
exports.UserService = {
    createUser,
    getAllUser,
    getMe,
    changePasswordService,
    updateEmergencyPhone,
    updateMe
};
