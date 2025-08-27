import { Request, Response } from "express";
import { catchAsync } from "../../middlewares/catchAsync";
import { sendResponse } from "../../middlewares/sendResponse";

const sendOTP = catchAsync(async (req : Request, res : Response) => {

    sendResponse(res, {
        statusCode : 200,
        success : true,
        message : "Otp send Successfully",
        data : null
    })
})

const verifyOTP = catchAsync(async  (req : Request, res : Response) => {

    sendResponse(res, {
        statusCode : 200,
        success : true,
        message : "Otp Verify Successfully",
        data : null
    })
})

export const OTPController = {
    sendOTP,
    verifyOTP
}