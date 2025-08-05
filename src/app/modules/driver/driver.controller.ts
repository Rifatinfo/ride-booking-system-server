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

        driverId: null,
        status: "COMPLETED"
    }).select("fare driverEarning completed")

    const totalEarnings = rides.reduce((sum, ride) => sum + ride.driverEarning, 0);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "My History fetched Successfully",
        data: {
            totalRides : rides.length,
            totalEarnings,
            rides
        },
    })
}

export const DriverController = {
    getDriverEarning
}