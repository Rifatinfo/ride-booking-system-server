"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rating = void 0;
const mongoose_1 = require("mongoose");
const ratingSchema = new mongoose_1.Schema({
    rideId: {
        type: mongoose_1.Types.ObjectId,
        ref: "Ride",
        required: true,
        unique: true,
    },
    riderId: {
        type: mongoose_1.Types.ObjectId,
        ref: "User",
        required: true,
    },
    driverId: {
        type: mongoose_1.Types.ObjectId,
        ref: "User",
        required: true,
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    feedback: {
        type: String,
        default: "",
    }
}, {
    timestamps: true,
    versionKey: false
});
exports.Rating = (0, mongoose_1.model)("Rating", ratingSchema);
