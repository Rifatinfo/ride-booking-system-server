import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import AppError from "../errorHelpers/AppError";
import { envVars } from "../config/env";
import { verifiedToken } from "../utils/jwt";
import { IUser } from "../modules/user/user.interface";

export const checkAuth = (...authRole: string[] )  => async (req: Request, res: Response, next: NextFunction) => {
  try{
     const accessToken = req.headers.authorization;
     if(!accessToken){
       throw new AppError(StatusCodes.BAD_REQUEST, "No Token Received");
     }

     const verifyToken = verifiedToken(accessToken, envVars.JWT_ACCESS_SECRET) as IUser;
     if(!verifyToken){
       throw new AppError(StatusCodes.BAD_REQUEST, `You are not authorized `);
     }

     if(!authRole.includes(verifyToken.role)){
      throw new AppError(StatusCodes.BAD_REQUEST, `You are not authorized`);
     }

     req.user  = verifyToken;
     next();
  } catch(error){
     next(error)
  }
}