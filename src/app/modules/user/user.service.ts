import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IUser } from "./user.interface";
import { User } from "./user.model";
import bcrypt from "bcryptjs";

const createUser = async (payload : Partial<IUser>) => {
    const {password , email, role, ...rest} = payload;
    const isUserExist = await User.findOne({email}).select('+status');;

    if(isUserExist){
      throw new AppError(StatusCodes.BAD_REQUEST, "User Already Exist");
    }

    const hashPassword = await bcrypt.hash(password as string, 10);
    const authProvider : IAuthProvider = {
        provider : "credential" , 
        providerId : email as string
    }

    const user = await User.create({
        email,
        password  : hashPassword,
        auth : [authProvider], 
        role : payload.role,
        ...rest
    })
    return user;
}

const getAllUser = async () => {
    const users = await User.find({});
    const totalUsers = await User.countDocuments();
    return {
        data : users,
        meta : {
            total : totalUsers
        }
    };
}
const getMe = async () => {
    const users = await User.findOne({});
    // const totalUsers = await User.countDocuments();
    return {
        data : users,
        // meta : {
        //     total : totalUsers
        // }
    };
}

export const UserService = {
    createUser,
    getAllUser,
    getMe
}