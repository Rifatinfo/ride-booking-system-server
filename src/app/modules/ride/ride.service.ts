import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { IUser } from "../user/user.interface";
import { IRide, RideStatus } from "./ride.interface"
import { Ride } from "./ride.model"
import calculateDistance from "../../utils/calculateDistance";
import { User } from "../user/user.model";



const requestRide = async (payload: Partial<IRide>, riderId: string) => {
    const { pickupLocation, destinationLocation } = payload;
    if (!pickupLocation || !destinationLocation) {
        throw new Error("Missing pickup or destination location");
    }
    /** Find nearest available driver (within 5km) */
    const driver = await User.findOne({
        role: 'DRIVER',
        isAvailable: true,
        isBlocked: false,
        status: 'APPROVED',
        // location: {
        //     $near: {
        //         $geometry: {
        //             type: 'Point',
        //             coordinates: [pickupLocation.lng, pickupLocation.lat]
        //         },
        //         $maxDistance: 5000   // in meter
        //     }
        // }
    })
    if (!driver) {
        throw new AppError(StatusCodes.FORBIDDEN, 'No Available drives nearby , Please rider Near 5km location set update by Driver');
    }




    /* Calculate distance using Function  */
    // const distance = calculateDistance(
    //     pickupLocation.lat, pickupLocation.lng,
    //     destinationLocation.lat, destinationLocation.lng
    // )

    // const baseFare = 100;
    // const perKmRate = 20;
    // const calculateFare = baseFare + (distance * perKmRate);
    // const driverEarning = calculateFare + 0.8;




    // TODO : driver assignment is optional 
    const ride = await Ride.create({
        ...payload,
        riderId,
        pickupLocation,
        destinationLocation,
        // fare: calculateFare,
        // driverEarning,
        driverId: driver._id,
        status: "REQUESTED",
        requestedAt: new Date()
    })
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
    await driver.save();

    return ride;
}
// const requestRide = async (payload: Partial<IRide>, riderId: string) => {
//     const ride = await Ride.create({
//         ...payload,
//         riderId, // explicitly set here
//         driverId: null,
//         status: "REQUESTED",
//         requestedAt: new Date()
//     })
//     return ride;
// }


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

    if (user.role === "DRIVER") {
        if (ride.driverId?.toString() !== user._id) {
            throw new AppError(StatusCodes.BAD_REQUEST, "You are not the assigned driver for this ride.");
        }
        if (user.isBlocked || user.status !== 'APPROVED') {
            throw new AppError(403, 'Suspended or unapproved drivers cannot accept rides');
        }
    }
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
    //     status: { $in: ['ACCEPTED', 'PICKED'] }
    // });

    // if (existingDriverRide) {
    //     throw new AppError(StatusCodes.CONFLICT, "You already have an active ride");
    // }

    // Increase cancel attempt count 
    ride.cancelAttemptCount += 1;
    return await ride.save();
}

const getRidesByRiderId = async (riderId: string) => {
    return Ride.find({ riderId }).sort({ createdAt: -1 })

}

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
    getAnalytics
}