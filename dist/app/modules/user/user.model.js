"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const user_interface_1 = require("./user.interface");
const zod_1 = require("zod");
const authProviderSchema = new mongoose_1.Schema({
    provider: { type: String, required: true },
    providerId: { type: String, required: true }
});
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    vehicle: { type: String },
    address: { type: String },
    password: { type: String },
    phone: { type: String },
    emergency_phone: { type: String },
    isBlocked: { type: zod_1.boolean, default: false },
    isDeleted: { type: zod_1.boolean },
    isActive: {
        type: String,
        enum: Object.values(user_interface_1.IsActive)
    },
    isAvailable: {
        type: String,
        default: false
    },
    auth: [authProviderSchema],
    role: {
        type: String,
        enum: Object.values(user_interface_1.Role),
        default: user_interface_1.Role.RIDER
    },
    vehicleInfo: {
        model: { type: String },
        licensePlate: { type: String }
    },
    riderHistory: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Ride",
        }
    ],
    currentRideId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Ride'
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'SUSPENDED', "BLOCKED", "COMPLETED", "PICKED", "IN_TRANSIT", "REQUESTED"],
        default: 'PENDING'
    },
    isVerified: { type: Boolean, default: false },
    cancelAttemptCount: {
        type: Number,
        default: 0
    },
    averageRating: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    versionKey: false
});
exports.User = (0, mongoose_1.model)("User", userSchema.index({ location: '2dsphere' }));
