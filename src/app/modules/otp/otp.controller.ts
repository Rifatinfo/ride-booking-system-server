import { Request, Response } from "express";
import { catchAsync } from "../../middlewares/catchAsync";
import { sendResponse } from "../../middlewares/sendResponse";
import { OTPService } from "./otp.services";

const sendOTP = catchAsync(async (req : Request, res : Response) => {
    const {email , name } = req.body;
    await OTPService.sendOTP(email, name);
    sendResponse(res, {
        statusCode : 200,
        success : true,
        message : "Otp send Successfully",
        data : null
    })
})

const verifyOTP = catchAsync(async  (req : Request, res : Response) => {
    const {email, otp} = req.body;
    await OTPService.verifyOTP(email, otp) 
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