import { model, Schema } from "mongoose";
import { IPayment, PAYMENT_STATUS } from "./payment.interface";
import { string } from "zod/v4/core/regexes.cjs";

const paymentSchema = new Schema<IPayment>({
    ride : {type : Schema.Types.ObjectId, ref : "Ride", required : true},
    user : {type : Schema.Types.ObjectId, ref : "User", required : true},
    amount : {type : Number, required : true},
    paymentStatus : {
        type : String,
        enum : Object.values(PAYMENT_STATUS)
    },
    transactionId : {type : String},
},{
    timestamps : true
})

export const Payment = model<IPayment>("Payment", paymentSchema);