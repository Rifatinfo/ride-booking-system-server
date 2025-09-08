import { Types } from "mongoose";

export enum PAYMENT_STATUS {
    PAID = "PAID",
    UNPAID = "UNPAID",
    CANCELLED = "CANCELLED",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED"
}

export interface IPayment {
    ride: Types.ObjectId;
    user: Types.ObjectId;
    amount: number;
    paymentStatus: PAYMENT_STATUS;
    transactionId?: string;
    createdAt?: Date;
    updatedAt?: Date;
}