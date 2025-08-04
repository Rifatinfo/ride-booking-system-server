import { Request, Response } from "express"
import { catchAsync } from "../../middlewares/catchAsync"
import { RideService } from "./ride.service";
import { StatusCodes } from "http-status-codes";
import { sendResponse } from "../../middlewares/sendResponse";
import AppError from "../../errorHelpers/AppError";
import { Ride } from "./ride.model";

const createRideRequest = catchAsync(async (req: Request, res: Response) => {
    const ride = await RideService.requestRide(req.body);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.CREATED,
        message: "Ride Request In Successfully",
        data: ride
    })
})

const updateRideStatus = catchAsync(async (req: Request, res: Response) => {
    const riderId = req.params.id;
    const { status } = req.body;
    const user = req.user;
    console.log(user);

    if (!user) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Not Found User")
    }

    const result = await RideService.updateRideStatus(riderId, status, user);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Ride Status Update Successfully",
        data: result,
    })
})

const getMyRides = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "User not authenticated");
    }

    const myRides = await Ride.find({riderId : user._id});
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "My rides fetched Successfully",
        data: myRides,
    }) 
})

export const RideController = {
    createRideRequest,
    updateRideStatus,
    getMyRides
}