import { model, Schema } from "mongoose";
import { IAuthProvider, IsActive, IUser, Role } from "./user.interface";
import { boolean } from "zod";

const authProviderSchema = new Schema<IAuthProvider>({
    provider: { type: String, required: true },
    providerId: { type: String, required: true }
})

const userSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true },
    vehicle : { type: String},
    address : { type: String},
    password: { type: String },
    phone: { type: String },
    emergency_phone: { type: String },
    isBlocked: { type: boolean, default: false },
    isDeleted: { type: boolean },
    isActive: {
        type: String,
        enum: Object.values(IsActive)
    },
    isAvailable: {
        type: String,
        default: false
    },
    auth: [authProviderSchema],
    role: {
        type: String,
        enum: Object.values(Role),
        default: Role.RIDER
    },
    vehicleInfo: {
        model: { type: String },
        licensePlate: { type: String }
    },
    riderHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Ride",
        }
    ],
    currentRideId: {
        type: Schema.Types.ObjectId,
        ref: 'Ride'
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'SUSPENDED', "BLOCKED", "COMPLETED", "PICKED" , "IN_TRANSIT", "REQUESTED"],
        default: 'PENDING'
    },
    isVerified : {type : Boolean, default : false},

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
})

export const User = model<IUser>("User", userSchema.index({ location: '2dsphere' }))