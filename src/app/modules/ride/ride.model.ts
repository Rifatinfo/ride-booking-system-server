import { model, Schema, Types } from "mongoose";

const locationSchema = new Schema({
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
}, {
    _id: false
})

const rideSchema = new Schema({
    riderId: {
        type: Types.ObjectId,
        ref: 'User',
        required: true
    },
    driverId: {
        type: Types.ObjectId,
        ref: "User",
        default: null
    },
    pickupLocation: {
        type: locationSchema,
        required: true
    },
    destinationLocation: {
        type: locationSchema,
        required: true
    },
    status: {
        type: String,
        enum: ["REQUESTED", "ACCEPTED", "PICKED", "IN_TRANSIT", "COMPLETED", "CANCEL_BY_RIDER", "CANCEL_BY_DRIVER"],
        default: "REQUESTED"
    },
    fare: {
        type: Number
    },
    requestedAt: Date,
    acceptedAt: Date,
    pickedUpAt: Date,
    completedAt: Date,
    canceledAt: Date,
    cancellationReason: {
        type: String
    }
})

export const Ride = model("Ride", rideSchema); 