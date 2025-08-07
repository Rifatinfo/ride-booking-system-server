import { model, Schema, Types } from "mongoose";

const ratingSchema = new Schema({
    rideId: {
        type: Types.ObjectId,
        ref: "Ride",
        required: true,
        unique: true,
    },
    riderId: {
        type: Types.ObjectId,
        ref: "User",
        required: true,
    },
    driverId : {
        type: Types.ObjectId,
        ref: "User",
        required: true,
    },
    rating : {
        type : Number,
        min : 1,
        max : 5,
        required : true
    },
    feedback : {
        type : String,
        default : "",
    }
},{
    timestamps : true,
    versionKey : false
})

export const Rating = model("Rating", ratingSchema);