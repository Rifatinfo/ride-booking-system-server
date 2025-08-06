import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { IUser } from "../user/user.interface";
import { IRide, RideStatus } from "./ride.interface"
import { Ride } from "./ride.model"
import { User } from "../user/user.model";
import calculateDistance from "../../utils/calculateDistance";


const requestRide = async (payload: IRide) => {
    const { pickupLocation, destinationLocation, riderId } = payload;
    /** Find nearest available driver (within 5km) */
    const driver = await User.findOne({
        role: 'DRIVER',
        isAvailable: true,
        isBlocked: false,
        status: 'APPROVED',
        location: {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinate: [pickupLocation.lng, pickupLocation.lat]
                },
                $maxDistance: 5000   // in meter
            }
        }
    })
    if (!driver) {
        throw new AppError(StatusCodes.FORBIDDEN, 'No Available drives nearby');
    }



    /* Calculate distance using Function  */
    const distance = calculateDistance(
        pickupLocation.lat, pickupLocation.lng,
        destinationLocation.lat, destinationLocation.lng
    )

    const baseFare = 100;
    const perKmRate = 20;
    const calculateFare = baseFare + (distance * perKmRate);
    const driverEarning = calculateFare + 0.8;


    /** Check if user already has an active */
    const existingRide = await Ride.findOne({
        riderId,
        status: { $in : ['REQUESTED', 'ACCEPTED', 'PICKED_UP', 'IN_TRANSIT']}
    })

    if(existingRide){
      throw new AppError(StatusCodes.CONFLICT, 'You already have an active');
    }

    // TODO : driver assignment is optional 
    const ride = await Ride.create({
        ...payload,
        riderId,
        pickupLocation,
        destinationLocation,
        fare: calculateFare,
        driverEarning,
        driverId: null,
        status: "REQUESTED",
        requestedAt: new Date()
    })


    // mark driver available
    driver.isAvailable = false;
    await driver.save();

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

    if (user.isBlocked || user.status !== 'APPROVED') {
        throw new AppError(403, 'Suspended or unapproved drivers cannot accept rides');
    }

    if(ride.cancelAttemptCount >= 5){
        throw new AppError(403, 'You have reached the maximum number if cancel attempts .');
    }
    const existingDriverRide = await Ride.findOne({
        driverId :  ride.driverId?.toString(),
        status : {$in : ['ACCEPTED', 'PICKED']}
    });

    if(existingDriverRide){
        throw new AppError(StatusCodes.CONFLICT, "You already have am active ride");
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

        if (ride.status === "CANCEL_BY_RIDER") {
            console.log("Ride is already canceled by rider");
        } else if (ride.status === "REQUESTED" || ride.status === "ACCEPTED") {
            ride.status = "CANCEL_BY_RIDER";
            ride.canceledAt = new Date();
            ride.cancellationReason = "Cancel by rider";
        } else {
            throw new AppError(StatusCodes.BAD_REQUEST, "Cannot cancel this ride at it's current status");
        }
    }

    // Increase cancel attempt count 
    ride.cancelAttemptCount += 1;
    return await ride.save();
}

const getRidesByRiderId = async (riderId: string) => {
    return Ride.find({ riderId }).sort({ createdAt: -1 })

}

export const RideService = {
    requestRide,
    updateRideStatus,
    getRidesByRiderId
}