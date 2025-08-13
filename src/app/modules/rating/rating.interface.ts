// interfaces/rating.interface.ts

import { Types } from "mongoose";

export interface IRating {
    _id?: Types.ObjectId;

    rideId: Types.ObjectId;
    riderId: Types.ObjectId;
    driverId: Types.ObjectId;
    rating: number;
    feedback?: string;
}