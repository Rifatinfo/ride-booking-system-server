import { JwtPayload } from "jsonwebtoken"
import { envVars } from "../config/env"
import { IsActive, IUser } from "../modules/user/user.interface"
import { User } from "../modules/user/user.model"
import { generateToken, verifiedToken } from "./jwt"
import AppError from "../errorHelpers/AppError"
import { StatusCodes } from "http-status-codes"

export const createUserToken = (user: Partial<IUser>) => {
    console.log(user);
    
    const jwtPayload = {
        userId: user._id,
        email: user.email,
        role: user.role,
        status: user.status,
    }

    const accessToken = generateToken(jwtPayload, envVars.JWT_ACCESS_SECRET, envVars.JWT_ACCESS_EXPIRES)
    const refreshToken = generateToken(jwtPayload, envVars.JWT_REFRESH_SECRET, envVars.JWT_REFRESH_EXPIRES)

    return {
        accessToken,
        refreshToken
    }
}

export const createNewAccessTokenWithRefreshToken = async (refreshToken: string) => {
    const verifiedRefreshToken = verifiedToken(refreshToken, envVars.JWT_REFRESH_SECRET) as JwtPayload;
    const isUserExist = await User.findOne({ email: verifiedRefreshToken.email });
    if (!isUserExist) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Email does not exit");
    }
    if ((isUserExist.isActive === IsActive.BLOCKED) || (isUserExist.isActive === IsActive.INACTIVE)) {
        throw new AppError(StatusCodes.BAD_REQUEST, `User is ${isUserExist.isActive}`);
    }
    if (isUserExist.isDeleted) {
        throw new AppError(StatusCodes.BAD_REQUEST, `User is Deleted`);
    }

    const jwtPayload = {
        userId: isUserExist._id,
        email: isUserExist.email,
        role: isUserExist.role,
        status: isUserExist.status,
    }

    const accessToken = generateToken(jwtPayload, envVars.JWT_ACCESS_SECRET, envVars.JWT_ACCESS_EXPIRES);
    return {
        accessToken
    }
} 