"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ride = void 0;
const mongoose_1 = require("mongoose");
const rideSchema = new mongoose_1.Schema({
    riderId: {
        type: mongoose_1.Types.ObjectId,
        ref: 'User',
        required: true
    },
    driverId: {
        type: mongoose_1.Types.ObjectId,
        ref: "User",
        default: null
    },
    pickupLocation: { type: String, required: true },
    destinationLocation: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["REQUESTED", "ACCEPTED", "PICKED", "IN_TRANSIT", "COMPLETED", "CANCEL_BY_RIDER", "CANCEL_BY_DRIVER", "PAYMENT_COMPLETE"],
        default: "REQUESTED"
    },
    fare: {
        type: Number
    },
    driverEarning: {
        type: Number,
        required: true,
        default: 0,
    },
    requestedAt: Date,
    acceptedAt: Date,
    pickedUpAt: Date,
    completedAt: Date,
    canceledAt: Date,
    cancellationReason: {
        type: String
    },
    cancelAttemptCount: {
        type: Number,
        default: 0
    },
    payment: { type: mongoose_1.Schema.Types.ObjectId, ref: "Payment" },
}, {
    timestamps: true,
    versionKey: false
});
exports.Ride = (0, mongoose_1.model)("Ride", rideSchema);
