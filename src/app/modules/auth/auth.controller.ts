import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../middlewares/catchAsync";
import { AuthService } from "./auth.service";
import { sendResponse } from "../../middlewares/sendResponse";
import { StatusCodes } from "http-status-codes";

const credentialLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const loginInfo = await AuthService.credentialLogin(req.body);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "User Logged In Successfully",
        data: loginInfo
    })
})

export const AuthProvider = {
    credentialLogin
} 