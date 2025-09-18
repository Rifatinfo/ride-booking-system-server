import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IUser } from "./user.interface";
import { User } from "./user.model";
import bcrypt from "bcryptjs";

const createUser = async (payload: Partial<IUser>) => {
  const { password, email, role, emergency_phone, address, ...rest } = payload;
  const isUserExist = await User.findOne({ email }).select('+status');

  if (isUserExist) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User Already Exist");
  }

  const hashPassword = await bcrypt.hash(password as string, 10);
  const authProvider: IAuthProvider = {
    provider: "credential",
    providerId: email as string
  }

  const user = await User.create({
    email,
    password: hashPassword,
    auth: [authProvider],
    role: payload.role,
    emergency_phone,
    address,
    ...rest
  })
  return user;
}

const getAllUser = async () => {
  const users = await User.find({});
  const totalUsers = await User.countDocuments();
  return {
    data: users,
    meta: {
      total: totalUsers
    }
  };
}
const getMe = async (userId: string) => {
  const users = await User.findById(userId).select("-password");
  return {
    data: users,
  };
}

const changePasswordService = async (userId: string, oldPassword: string, newPassword: string) => {
  const user = await User.findById(userId).select("+password"); // include password
  if (!user) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User not found");
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password as string);
  if (!isMatch) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Old password is incorrect");
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  // return safe info (not password)
  return {
    _id: user._id,
    email: user.email,
    role: user.role,
  };
}

const updateEmergencyPhone = async (userId: string, emergency_phone: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User is not Found");
  }


  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { emergency_phone },
    { new: true }
  );
  return updatedUser;
}
export const UserService = {
  createUser,
  getAllUser,
  getMe,
  changePasswordService,
  updateEmergencyPhone
}