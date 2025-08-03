import { NextFunction, Request, Response } from "express";
import { UserService } from "./user.service";
import { StatusCodes } from 'http-status-codes';
import { catchAsync } from "../../middlewares/catchAsync";
import { sendResponse } from "../../middlewares/sendResponse";

const createUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserService.createUser(req.body);
    sendResponse(res, {
        success : true,
        statusCode : StatusCodes.CREATED,
        message : "User Created Successfully",
        data : user
    })
})
const getAllUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const users = await UserService.getAllUser();
    sendResponse(res, {
        success : true,
        statusCode : StatusCodes.OK,
        message : "All User Retrieved Successfully",
        data : users.data,
        meta : users.meta
    })
})
export const UserController = {
    createUser,
    getAllUser
}