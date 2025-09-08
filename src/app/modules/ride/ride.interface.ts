import { Types } from "mongoose";

export type RideStatus =
    | "REQUESTED"
    | "ACCEPTED"
    | "PICKED"
    | "IN_TRANSIT"
    | "COMPLETED"
    | "CANCEL_BY_RIDER"
    | "CANCEL_BY_DRIVER"
    | "PAYMENT_COMPLETE"



export interface ILocation {
    lat?: number;
    lng?: number;
    address?: string
}

export interface IRide {
    _id?: Types.ObjectId;

    /* Relational */
    riderId?: Types.ObjectId;   // User who requested the ride
    driverId?: Types.ObjectId | null;   // Assigned diver 

    /* Ride Details */
    pickupLocation: string;
    destinationLocation: string;

    fare?: number;
    driverEarning? : number;
    
    /* Optional : Timestamps for each status */
    requestedAt?: Date;
    acceptedAt?: Date;
    pickedUpAt?: Date;
    completedAt?: Date;
    canceledAt?: Date;
    payment ? : Types.ObjectId;
    status : RideStatus;
    // Cancel By rider or driver 
    cancellationReason? : string;
    cancelAttemptCount? : {
        type : Number,
    }
}