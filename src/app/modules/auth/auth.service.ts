import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { IUser } from "../user/user.interface";
import { User } from "../user/user.model";
import bcrypt from "bcryptjs";
import { createNewAccessTokenWithRefreshToken, createUserToken } from "../../utils/userToken";

const credentialLogin = async (payload: Partial<IUser>) => {
    const { email, password } = payload;

    const isUserExist = await User.findOne({email});
    if(!isUserExist){
      throw new AppError(StatusCodes.BAD_REQUEST, "Email does not exit");
    }

    const isPasswordMatch = await  bcrypt.compare(password as string, isUserExist.password as string);
    if(!isPasswordMatch){
       throw new AppError(StatusCodes.BAD_REQUEST, "Incorrect Password");
    }
    
    const jwtPayload = {
        userId : isUserExist._id,
        email : isUserExist.email,
        role : isUserExist.role 
    }
    
    const userToken = createUserToken(isUserExist);
    const {password : pass,  ...rest} = isUserExist.toObject();

    return {
        accessToken : userToken.accessToken,
        refreshToken : userToken.refreshToken,
        user : rest
    }
} 

const getNewAccessToken = async (refreshToken : string ) => {
   const newAccessToken = await createNewAccessTokenWithRefreshToken(refreshToken);

   return {
    accessToken : newAccessToken.accessToken
   }
}

export const AuthService = {
    credentialLogin,
    getNewAccessToken
}