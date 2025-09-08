import { model, Schema, Types } from "mongoose";


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
    cancelAttemptCount : {
        type : Number,
        default : 0
    },
    payment: { type: Schema.Types.ObjectId, ref: "Payment" },

},{
    timestamps : true,
    versionKey : false
})

export const Ride = model("Ride", rideSchema); 