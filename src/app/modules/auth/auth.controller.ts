import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../middlewares/catchAsync";
import { AuthService } from "./auth.service";
import { sendResponse } from "../../middlewares/sendResponse";
import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { setAuthCookie } from "../../utils/setCookies";

const credentialLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const loginInfo = await AuthService.credentialLogin(req.body);
    res.cookie("refreshToken", loginInfo.refreshToken , {
        httpOnly : true,
        secure : true,
        sameSite : "none"
    })
    res.cookie("accessToken", loginInfo.accessToken , {
        httpOnly : true,
        secure :  true,
        sameSite : "none"
    })
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "User Logged In Successfully",
        data: loginInfo
    })
})

const getNewAccessToken = catchAsync(async (req : Request, res: Response, next:NextFunction) => {
     const refreshToken = req.cookies.refreshToken;
     if(!refreshToken){
       throw new AppError(StatusCodes.BAD_REQUEST, "No Refresh token received");
     }

     const tokenInfo = await AuthService.getNewAccessToken(refreshToken as string);
     setAuthCookie(res, tokenInfo);
     sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "New Access Token Retrieved In Successfully",
        data: tokenInfo
    })
})
const logout = catchAsync(async (req:Request , res : Response, next: NextFunction) => {
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    })
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    })
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "User Logout Successfully",
        data: null,
    })
})

export const AuthProvider = {
    credentialLogin,
    getNewAccessToken,
    logout
} 