import { Request, Response } from "express"
import AppError from "../../errorHelpers/AppError";
import { StatusCodes } from "http-status-codes";
import { Ride } from "../ride/ride.model";
import { sendResponse } from "../../middlewares/sendResponse";
import mongoose from "mongoose";


// const getDriverEarning = async (req: Request, res: Response) => {
//     const user = req.user;
//     if (!user) {
//         throw new AppError(StatusCodes.UNAUTHORIZED, "User not authenticated");
//     }
//     if (user.role !== "DRIVER") {
//         throw new AppError(StatusCodes.UNAUTHORIZED, "User not authenticated");
//     }

//     const rides = await Ride.find({

//         driverId: user.userId,
//         status: "COMPLETED"
//     }).select("fare driverEarning pickupLocation destinationLocation completedAt status").populate("riderId", "name email") 

//     const totalEarnings = rides.reduce((sum, ride) => sum + ride.driverEarning, 0);

//     // start to day 
//     const today = new Date();

//     const starOfDay = new Date(today);
//     starOfDay.setHours(0, 0, 0, 0);

//     // start of week 
//     const startOfWeek = new Date(today);
//     startOfWeek.setDate(today.getDate() - today.getDay());
//     startOfWeek.setHours(0, 0, 0, 0);

//     // start of month 
//     const startOfMonth = new Date(today.getFullYear() , today.getDate(), 1);

//     // earning Daily 
//     const daily = await Ride.aggregate([
//         {
//             $match: {
//                 driverId: user.userId,
//                 status: "COMPLETED",
//                 completedAt : {$gte : starOfDay}
//             },
//         },
//         {$group : {_id : null , total : {$sum : "$driverEarning"}}}
//     ]);

//     // earning weekly 
//     const week = await Ride.aggregate([
//         {
//             $match: {
//                 driverId: user.userId,
//                 status: "COMPLETED",
//                 completedAt : {$gte : startOfWeek}
//             },
//         },
//         {$group : {_id : null , total : {$sum : "$driverEarning"}}}
//     ]);

//     // earning monthly  
//     const month = await Ride.aggregate([
//         {
//             $match: {
//                 driverId: user.userId,
//                 status: "COMPLETED",
//                 completedAt : {$gte : startOfMonth}
//             },
//         },
//         {$group : {_id : null , total : {$sum : "$driverEarning"}}}
//     ]);

//     sendResponse(res, {
//         success: true,
//         statusCode: StatusCodes.OK,
//         message: "My History fetched Successfully",
//         data: {
//             totalRides: rides.length,
//             totalEarnings,
//             daily : daily[0]?.total || 0,
//             weekly : week[0]?.total || 0,
//             monthly : month[0]?.total || 0,
//             rides,
//         },
//     })
// }


const getDriverEarning = async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "User not authenticated");
  }

  if (user.role !== "DRIVER") {
    throw new AppError(StatusCodes.FORBIDDEN, "Access denied");
  }

  const driverId = new mongoose.Types.ObjectId(user.userId);

  // ✅ Get all completed rides for this driver
  const rides = await Ride.find({
    driverId,
    status: "COMPLETED",
  })
    .select(
      "fare driverEarning pickupLocation destinationLocation completedAt status"
    )
    .populate("riderId", "name email");

  // ✅ Total earnings
  const totalEarnings = Math.round(rides.reduce(
    (sum, ride) => sum + (ride.driverEarning || 0),
    0
  ))

  // ✅ Date ranges
  const today = new Date();

  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  // ✅ Helper for aggregation
  const getEarning = async (startDate: Date) => {
    const result = await Ride.aggregate([
      {
        $match: {
          driverId,
          status: "COMPLETED",
          completedAt: { $gte: startDate },
        },
      },
      { $group: { _id: null, total: { $sum: "$driverEarning" } } },
    ]);
    return result[0]?.total || 0;
  };

const daily = Math.round(await getEarning(startOfDay));
const weekly = Math.round(await getEarning(startOfWeek));
const monthly = Math.round(await getEarning(startOfMonth));

  
  // ✅ Send response
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Driver earnings fetched successfully",
    data: {
      totalRides: rides.length,
      totalEarnings,
      daily,
      weekly,
      monthly,
      rides,
    },
  });
};








export const DriverController = {
    getDriverEarning
}