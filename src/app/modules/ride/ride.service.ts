import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { IUser } from "../user/user.interface";
import { IRide, RideStatus } from "./ride.interface"
import { Ride } from "./ride.model"


const requestRide = async (payload: IRide) => {
    // TODO : driver assignment is optional 
    const ride = await Ride.create({
        ...payload,
        driverId: null,
        status: "REQUESTED",
        requestedAt: new Date()
    })
    return ride;
}

const updateRideStatus = async (riderId: string, status: RideStatus, user: IUser) => {
    const ride = await Ride.findById(riderId);
    if (!ride) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Ride Not Found");
    }

    if (user.role === "DRIVER" && ride.driverId?.toString() !== user._id) {
        throw new AppError(StatusCodes.BAD_REQUEST, "You are not the assigned driver for this ride.");
    }

    ride.status = status;

    // Timestamp update 
    if (status === "ACCEPTED") ride.acceptedAt = new Date();
    if (status === "PICKED") ride.pickedUpAt = new Date();
    if (status === "COMPLETED") ride.completedAt = new Date();
    if (status === "CANCEL_BY_DRIVER") ride.canceledAt = new Date();

    /** If RIDER Cancels */
    console.log("ride.riderId:", ride.riderId.toString());
    console.log("user._id:", user.userId);
    console.log("Ride status before cancel:", ride.status);
    if (user.role === "RIDER") {
        if (ride.riderId.toString() !== user.userId) {
            throw new AppError(
                StatusCodes.BAD_REQUEST,
                `Unauthorized rider. Ride belongs to ${ride.riderId}, but you are ${user.userId}`
            );
        }

        if(ride.status === "CANCEL_BY_RIDER"){
           console.log("Ride is already canceled by rider");
        } else if(ride.status === "REQUESTED" || ride.status === "ACCEPTED"){
           ride.status = "CANCEL_BY_RIDER";
           ride.canceledAt = new Date();
           ride.cancellationReason = "Cancel by rider";
        } else {
            throw new AppError(StatusCodes.BAD_REQUEST, "Cannot cancel this ride at it's current status");
        }
    }
    

    return await ride.save();
}

export const RideService = {
    requestRide,
    updateRideStatus,
}