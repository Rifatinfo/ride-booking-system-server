import { Request, Response } from "express"
import { catchAsync } from "../../middlewares/catchAsync"
import { RideService } from "./ride.service";
import { StatusCodes } from "http-status-codes";
import { sendResponse } from "../../middlewares/sendResponse";
import AppError from "../../errorHelpers/AppError";
import { Ride } from "./ride.model";

const createRideRequest = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;

    if (!user || !user.userId) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Not Found User")
    }
    const ride = await RideService.requestRide(req.body, user.userId);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.CREATED,
        message: "Ride Request In Successfully",
        data: ride
    })
})

const getAllRiderRequest = catchAsync(async (req: Request, res: Response) => {
    // const riderId = req.user?.riderId;
    // if(!riderId){
    //       throw new AppError(StatusCodes.BAD_REQUEST, "Not Found Rider Request")
    // }
    // console.log(riderId);
    
    const rides = await RideService.getAllRiderRequest();
     sendResponse(res, {
        success: true,
        statusCode: StatusCodes.CREATED,
        message: "Ride Request In Successfully",
        data: rides
    })
})

const getCompletedRides = catchAsync(async (req: Request, res: Response) => {
    const completedRides = await RideService.completedRides();
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.CREATED,
        message: "Ride Request In Successfully",
        data: completedRides.data,
        meta: completedRides.meta
    })
})


const updateRideStatus = catchAsync(async (req: Request, res: Response) => {
    const riderId = req.params.id;
    const { status } = req.body;
    const user = req.user;
    console.log(user, riderId);

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
const cancelRiderByRider = catchAsync(async (req: Request, res: Response) => {
    const riderId = req.params.id;
    const user = req.user;
    console.log(user);

    if (!user) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Not Found User")
    }
    const ride = await RideService.updateRideStatus(riderId, "CANCEL_BY_RIDER", user);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Ride Canceled In Successfully by rider",
        data: ride
    })
})
const getMyRides = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    if (!user || !user.userId) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "User not authenticated");
    }

    const myRides = await RideService.getRidesByRiderId(user.userId);
    // const myRides = await Ride.find({ riderId: user._id });
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "My History fetched Successfully",
        data: myRides,
    })
})

const getRiderRideHistory = async (req: Request, res: Response) => {
    const user = req.user;
    console.log(user);

    if (!user) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "User not authenticated");
    }

    const rideHistory = await Ride.find({
        riderId: user.userId,
        status: { $in: ["COMPLETED", "CANCEL_BY_DRIVER", "CANCEL_BY_RIDER"] }
    }).sort({ requestedAt: -1 });

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Ride History (completed and canceled) fetched Successfully",
        data: rideHistory,
    });
}

const getAnalytics = catchAsync(async (req: Request, res: Response) => {
    const data = await RideService.getAnalytics();
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Analytics fetched successfully",
        data: data,
    });
})



export const RideController = {
    createRideRequest,
    updateRideStatus,
    getMyRides,
    cancelRiderByRider,
    getRiderRideHistory,
    getCompletedRides,
    getAnalytics,
    getAllRiderRequest
}