import { Request, Response } from "express"
import AppError from "../../errorHelpers/AppError";
import { StatusCodes } from "http-status-codes";
import { Ride } from "../ride/ride.model";
import { sendResponse } from "../../middlewares/sendResponse";


const getDriverEarning = async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "User not authenticated");
    }
    if (user.role !== "DRIVER") {
        throw new AppError(StatusCodes.UNAUTHORIZED, "User not authenticated");
    }

    const rides = await Ride.find({

        driverId: user.userId,
        status: "COMPLETED"
    }).select("fare driverEarning pickupLocation destinationLocation completedAt").populate("riderId", "name email pickupLocation destinationLocation") 

    const totalEarnings = rides.reduce((sum, ride) => sum + ride.driverEarning, 0);

    // start to day 
    const today = new Date();

    const starOfDay = new Date(today);
    starOfDay.setHours(0, 0, 0, 0);

    // start of week 
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // start of month 
    const startOfMonth = new Date(today.getFullYear() - today.getDate(), 1);

    // earning Daily 
    const daily = await Ride.aggregate([
        {
            $match: {
                driverId: user.userId,
                status: "COMPLETED",
                completedAt : {$gte : starOfDay}
            },
        },
        {$group : {_id : null , total : {$sum : "$driverEarning"}}}
    ]);

    // earning weekly 
    const week = await Ride.aggregate([
        {
            $match: {
                driverId: user.userId,
                status: "COMPLETED",
                completedAt : {$gte : startOfWeek}
            },
        },
        {$group : {_id : null , total : {$sum : "$driverEarning"}}}
    ]);

    // earning monthly  
    const month = await Ride.aggregate([
        {
            $match: {
                driverId: user.userId,
                status: "COMPLETED",
                completedAt : {$gte : startOfMonth}
            },
        },
        {$group : {_id : null , total : {$sum : "$driverEarning"}}}
    ]);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "My History fetched Successfully",
        data: {
            totalRides: rides.length,
            totalEarnings,
            daily : daily[0]?.total || 0,
            weekly : daily[0]?.total || 0,
            monthly : daily[0]?.total || 0,
            rides,
        },
    })
}

export const DriverController = {
    getDriverEarning
}