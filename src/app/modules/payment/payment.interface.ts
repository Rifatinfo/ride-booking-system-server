import { Types } from "mongoose";

export enum PAYMENT_STATUS {
    PENDING = "PENDING",
    SUCCESS = "SUCCESS",
    FAILED = "FAILED",
    CANCELLED = "CANCELLED"
}

export interface IPayment {
    ride : Types.ObjectId;
    user : Types.ObjectId;
    amount : number;
    paymentStatus : PAYMENT_STATUS;
    transactionId ? : string;
    createdAt? : Date;
    updatedAt? : Date;
}