import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { IUser } from "../user/user.interface";
import { IRide, RideStatus } from "./ride.interface"
import { Ride } from "./ride.model"
import { User } from "../user/user.model";
import { calculate, getCoordinate, getDistance } from "../../utils/geo/geo";
import { Payment } from "../payment/payment.model";
import { PAYMENT_STATUS } from "../payment/payment.interface";

const getTransactionId = () => {
    return `tran_${Date.now()}_${Math.floor(Math.random()) * 1000}`
}

const requestRide = async (payload: Partial<IRide>, riderId: string) => {
    const transactionId = getTransactionId();
    const session = await Ride.startSession();
    session.startTransaction();

    const { pickupLocation, destinationLocation } = payload;
    if (!pickupLocation || !destinationLocation) {
        throw new Error("Missing pickup or destination location");
    }
    /** Find nearest available driver (within 5km) */


     // step -1 
     const pickupCoords = await getCoordinate(pickupLocation);
     const destCoords = await getCoordinate(destinationLocation); 

     // step - 2
     const distance = await getDistance(pickupCoords, destCoords);

     // step - 3
     const fare = calculate(distance);
     const driverEarning = fare * 0.8;

    const driver = await User.findOne({
        role: 'DRIVER',
        isAvailable: true,
        isBlocked: false,
        status: 'APPROVED',
    })
    if (!driver) {
        throw new AppError(StatusCodes.FORBIDDEN, 'No Available drives');
    }


    // TODO : driver assignment is optional 
    const ride = await Ride.create([
        {
        ...payload,
        riderId,
        pickupLocation,
        destinationLocation,
        fare,
        driverEarning,
        driverId: driver._id,
        status: "REQUESTED",
        requestedAt: new Date()
    }
    ], {session})
    console.log(riderId);

    /** Check if user already has an active */
    if (riderId) {
        const existingRide = await Ride.findOne({
            riderId,
            status: { $in: ['ACCEPTED', 'PICKED_UP', 'IN_TRANSIT'] }
        })

        if (existingRide) {
            throw new AppError(StatusCodes.CONFLICT, 'You already have an active');
        }
    }
    // mark driver available
    driver.isAvailable = false;

    // // Payment Related 
    const payment = await Payment.create([
        {
        ride : ride[0]._id,
        user : riderId,
        amount : fare,
        transactionId : transactionId,
        paymentStatus : PAYMENT_STATUS.PENDING
    }
    ], {session})
    await session.commitTransaction();
    session.endSession();
    await driver.save();

    return {
        ride,
        payment
    };
}

const getAllRiderRequest = async () => {
    const rides = await Ride.find({ "status": ["REQUESTED", "ACCEPTED", "PICKED", "IN_TRANSIT", "COMPLETED", "CANCEL_BY_DRIVER"] }).sort({requestedAt : -1}).lean();
    console.log(rides);
    
    return rides;
}

const completedRides = async () => {
    const completedRides = await Ride.find({ status: "COMPLETED" })
    if (!completedRides.length) {
        throw new AppError(StatusCodes.NOT_FOUND, "No Completed rides found")
    }

    const totalCompleted = await Ride.countDocuments();
    return {
        data : completedRides,
        meta : {
            total : totalCompleted
        }
    }
}

const updateRideStatus = async (riderId: string, status: RideStatus, user: IUser) => {

    const ride = await Ride.findById(riderId);
    console.log(riderId);
    
    if (!ride) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Ride Not Found");
    }

    // if (user.role === "DRIVER") {
    //     if (ride.driverId?.toString() !== user._id) {
    //         throw new AppError(StatusCodes.BAD_REQUEST, "You are not the assigned driver for this ride.");
    //     }
    //     if (user.isBlocked || user.status !== 'APPROVED') {
    //         throw new AppError(403, 'Suspended or unapproved drivers cannot accept rides');
    //     }
    // }
    // if (user.role === "DRIVER" && ride.driverId?.toString() !== user._id) {
    //     throw new AppError(StatusCodes.BAD_REQUEST, "You are not the assigned driver for this ride.");
    // }
    // console.log(user.status);



    if (ride.cancelAttemptCount >= 15) {
        throw new AppError(403, 'You have reached the maximum number if cancel attempts .');
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
        if (ride.riderId?.toString() !== user.userId) {
            throw new AppError(
                StatusCodes.BAD_REQUEST,
                `Unauthorized rider. Ride belongs to ${ride.riderId}, but you are ${user.userId}`
            );
        }

        if (ride.status === "CANCEL_BY_RIDER") {
            console.log("Ride is already canceled by rider");
        } else if (ride.status === "REQUESTED" || ride.status === "ACCEPTED" || ride.status === "PICKED" || ride.status === "IN_TRANSIT") {
            ride.status = "CANCEL_BY_RIDER";
            ride.canceledAt = new Date();
            ride.cancellationReason = "Cancel by rider";
        } else {
            throw new AppError(StatusCodes.BAD_REQUEST, "Cannot cancel this ride at it's current status");
        }
    }

    //  const existingDriverRide = await Ride.findOne({
    //     driverId: ride.driverId?.toString(),
    //     status: { $in: ['COMPLETED'] }
    // });

    // if (existingDriverRide) {
    //     throw new AppError(StatusCodes.CONFLICT, "You already have completed Ride");
    // }

    if(user.role === "DRIVER" && status === "ACCEPTED"){
       const existingActiveRide = await Ride.findOne({
        driverId : user._id,
        status : { $in : ["ACCEPTED" , "PICKED" , "IN_TRANSIT"]}
       });

       if(existingActiveRide){
        throw new AppError(StatusCodes.CONFLICT, "You already have an active ride . Complete or cancel it before accepting another");
       }
    }

    ride.acceptedAt = new Date();

    // Increase cancel attempt count 
    ride.cancelAttemptCount += 1;
    return await ride.save();
}

const getRidesByRiderId = async (riderId: string) => {
    return Ride.find({ riderId }).sort({ createdAt: -1 })

}

const getRideById = async (rideId: string) => {
  return Ride.findById(rideId);
};

const getAnalytics = async () =>{
    const totalRides = await Ride.countDocuments();
    const completedRides = await Ride.countDocuments({status : "COMPLETED"});
    const canceledRides  = await Ride.countDocuments({status : {$in : ["CANCEL_BY_DRIVER", "CANCEL_BY_RIDER"]}});
    const ongoingRides  = await Ride.countDocuments({status : {$in : ["ACCEPTED" , "PICKED",
    "IN_TRANSIT"]}});

    console.log(totalRides,completedRides,canceledRides, ongoingRides);
    const totalRevenueData = await Ride.aggregate([
        { $match: { status: "COMPLETED" } },
        { $group: { _id: null, totalRevenue: { $sum: "$fare" }, averageFare: { $avg: "$fare" } } }
    ]);
    const topDrivers  = await Ride.aggregate([
        {$match : {status : "COMPLETED"}},
        {$group : {_id : "$driverId", rides : {$sum : 1}}},
        {$sort: {rides : -1}},
        {$limit : 5},
        {
            $lookup : {
                from : "users",
                localField : "_id",
                foreignField : "_id",
                as : "driver"
            }
        },
        {$unwind : "$driver"},
        {$project : {driverName : "$driver.name", rides : 1}},
    ]); 

    const avgDriverRating = await Ride.aggregate([
        {$match: {status : "COMPLETED", rating: {$exists : true}}},
        {$group : {_id : null, avgRating : {$avg: "$rating"}}}
    ])

     return {
        totalRides,
        completedRides,
        canceledRides,
        ongoingRides,
        totalRevenue: totalRevenueData[0]?.totalRevenue || 0,
        averageFare: totalRevenueData[0]?.averageFare || 0,
        topDrivers,
        avgDriverRating: avgDriverRating[0]?.avgRating || 0
    };
    
}

export const RideService = {
    requestRide,
    updateRideStatus,
    getRidesByRiderId,
    completedRides,
    getAnalytics,
    getAllRiderRequest,
    getRideById,
    
}