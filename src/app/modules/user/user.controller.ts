import { NextFunction, Request, Response } from "express";
import { UserService } from "./user.service";
import { StatusCodes } from 'http-status-codes';
import { catchAsync } from "../../middlewares/catchAsync";
import { sendResponse } from "../../middlewares/sendResponse";
import AppError from "../../errorHelpers/AppError";
import { User } from "./user.model";

const createUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserService.createUser(req.body);
    if (user.status === 'SUSPENDED') {
        throw new AppError(StatusCodes.FORBIDDEN, "Your Account is Suspended");
    }
    if (user.isBlocked) {
        throw new AppError(StatusCodes.FORBIDDEN, "Your account is blocked.");
    }

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.CREATED,
        message: "User Created Successfully",
        data: user
    })
})
/* Update Location on Profile Edit By Driver  */
const goOnline = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    // const { location } = req.body;

    // if (!location || !location.coordinates || !Array.isArray(location.coordinates) || location.coordinates.length !== 2) {
    //     throw new AppError(StatusCodes.FORBIDDEN, "Location is required and must be [lng, lat]");
    // }

    const updatedDriver = await User.findByIdAndUpdate(
        id,
        {
            isAvailable: true,
            // location,
        },
        { new: true }
    )

    if (!updatedDriver) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Driver not found");
    }

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Driver is now online and location updated",
        data: updatedDriver
    })
})
const getAllUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const users = await UserService.getAllUser();
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "All User Retrieved Successfully",
        data: users.data,
        meta: users.meta
    })
})
const getMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const userId = req.user?.userId;
    if (!userId) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "User Not Found");
    }

    const users = await UserService.getMe(userId);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "User Information Retrieved Successfully",
        data: users.data,
    })
})

const setAvailability = async (req: Request, res: Response) => {
    const user = req.user;
    const { isAvailable } = req.body;

    if (!user) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "User not authenticated");
    }
    if (typeof isAvailable !== 'boolean') {
        throw new AppError(StatusCodes.BAD_REQUEST, "isAvailable must be a boolean");
    }
    const updatedDriver = await User.findByIdAndUpdate(
        user.userId,
        { isAvailable },
        { new: true }
    )
    if (!updatedDriver) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Driver not Found");
    }
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: `Driver is Now ${isAvailable ? "Online" : "Offline"}`,
        data: updatedDriver
    })
}

// user.controller.ts

const getAllDrivers = async (req: Request, res: Response) => {
    const drivers = await User.find({ role: "DRIVER" }).select("-password");

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "All drivers fetched successfully",
        data: drivers
    });
};

const updateDriverStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['APPROVED', 'SUSPENDED'].includes(status)) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Invalid Status")
    }

    const updateUser = await User.findByIdAndUpdate(
        id,
        { status },
        { new: true }
    ).select("-password");

    if (!updateUser) {
        throw new AppError(StatusCodes.NOT_FOUND, "Driver Not Found");
    }

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: `Driver ${status.toLowerCase()} successfully`,
        data: updateUser
    });
}

const blockUser = async (req: Request, res: Response) => {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
        throw new AppError(StatusCodes.NOT_FOUND, "User not Founded");
    }

    user.isBlocked = true;
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: `User has been blocked`,
        data: user
    });
    await user.save();
}
const unblockUser = async (req: Request, res: Response) => {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
        throw new AppError(StatusCodes.NOT_FOUND, "User not Founded");
    }

    user.isBlocked = false;
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: `User has been blocked`,
        data: user
    });
    await user.save();
}
const changePasswordController = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId; // from checkAuth
        if (!userId) {
            throw new AppError(StatusCodes.BAD_REQUEST, "User not found");
        }

        const { oldPassword, newPassword, name, phone } = req.body;
        if (!oldPassword || !newPassword) {
            throw new AppError(StatusCodes.BAD_REQUEST, "Both old and new passwords are required");
        }

        const result = await UserService.changePasswordService(userId, oldPassword, newPassword, { name, phone });

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: "Password changed successfully",
            data: result, // return some safe info (not password)
        });
    } catch (error: any) {
        console.error("Change password error:", error);
        res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message || "Something went wrong",
        });
    }
};

const allUsers = async (req: Request, res: Response) => {
    const allUsers = await User.find().select("-password");

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "All Users fetched successfully",
        data: allUsers
    });
};
const toggleBlocked = async (req: Request, res: Response) => {
    const userId = req.params;

    const { isBlocked } = req.body;

    if (!userId) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "User not authenticated");
    }
    if (typeof isBlocked !== 'boolean') {
        throw new AppError(StatusCodes.BAD_REQUEST, "isBlocked must be a boolean");
    }
    const updatedUser = await User.findByIdAndUpdate(
        userId.userId,
        { isBlocked },
        { new: true }
    )
    if (!updatedUser) {
        throw new AppError(StatusCodes.BAD_REQUEST, "User not Found");
    }

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: `User ${isBlocked ? "blocked" : "unblocked"} successfully`,
        data: updatedUser
    });
};


const updateEmergencyPhoneController = async (req: Request, res: Response) => {
    //   const userId = req.user?.userId; // from checkAuth
    const userId = req.params;

    if (!userId) {
        throw new AppError(StatusCodes.BAD_REQUEST, "User not found");
    }

    const { emergency_phone } = req.body;
    console.log(userId?.userId)
    const updatedUser = await UserService.updateEmergencyPhone(userId.userId, emergency_phone);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Emergency phone updated successfully",
        data: updatedUser,
    });
};


const updateMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;
    if (!userId) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "User Not Found");
    }

    const user = await UserService.updateMe(userId, req.body);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Emergency phone updated successfully",
        data: user.data,
    });
})

export const UserController = {
    createUser,
    getAllUser,
    setAvailability,
    getAllDrivers,
    updateDriverStatus,
    blockUser,
    unblockUser,
    goOnline,
    getMe,
    changePasswordController,
    allUsers,
    toggleBlocked,
    updateEmergencyPhoneController,
    updateMe
}