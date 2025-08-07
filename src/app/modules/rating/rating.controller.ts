import { Request, Response } from "express";
import { Ride } from "../ride/ride.model";
import AppError from "../../errorHelpers/AppError";
import { StatusCodes } from "http-status-codes";
import { Rating } from "./rating.model";
import { User } from "../user/user.model";
import { sendResponse } from "../../middlewares/sendResponse";

const createRating = async (req: Request, res: Response) => {
  const { rideId, rating, feedback } = req.body;
  const riderId = req.user?.userId;

  // Validate ride
  const ride = await Ride.findById(rideId);
  console.log(ride);
  console.log("rideId type:", typeof rideId, rideId);
  
  if (!ride) {
    throw new AppError(StatusCodes.NOT_FOUND, "Ride does not exist");
  }

  if (ride.status !== "COMPLETED") {
    throw new AppError(StatusCodes.BAD_REQUEST, "You can only rate completed rides");
  }

  if (ride.riderId.toString() !== riderId) {
    throw new AppError(StatusCodes.FORBIDDEN, "You are not allowed to rate this ride");
  }

  // Prevent duplicate rating
  const existing = await Rating.findOne({ rideId });
  if (existing) {
    throw new AppError(StatusCodes.CONFLICT, "You already rated this ride");
  }

  // Validate rating
  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Rating must be a number between 1 and 5");
  }

  // Validate feedback
  if (!feedback || feedback.trim() === "") {
    throw new AppError(StatusCodes.BAD_REQUEST, "Feedback is required");
  }

  // Create the new rating
  const newRating = await Rating.create({
    rideId,
    riderId,
    driverId: ride.driverId,
    rating,
    feedback
  });

  // Recalculate driver's average rating
  const ratings = await Rating.find({ driverId: ride.driverId });
  const avgRating = ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length;

  // Update driver's averageRating
  await User.findByIdAndUpdate(ride.driverId, { averageRating: avgRating });

  // Send response
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: "Rating added successfully",
    data: newRating
  });
};

export const RatingRoute = {
    createRating
}