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

const updateRideStatus = async (riderId: string, status: RideStatus, user : IUser) => {
    const ride = await Ride.findById(riderId);
    if (!ride) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Ride Not Found");
    }

    if (user.role === "DRIVER" && ride.driverId?.toString() !== user._id) {
        throw new AppError(StatusCodes.BAD_REQUEST, "You are not the assigned driver for this ride.");
    }

    ride.status = status;

    // Timestamp update 
    if(status === "ACCEPTED") ride.acceptedAt = new Date();
    if(status === "PICKED") ride.pickedUpAt = new Date();
    if(status === "COMPLETED") ride.completedAt = new Date();
    if(status === "CANCEL_BY_DRIVER") ride.canceledAt = new Date();

    return await ride.save();
}

export const RideService = {
    requestRide,
    updateRideStatus
}