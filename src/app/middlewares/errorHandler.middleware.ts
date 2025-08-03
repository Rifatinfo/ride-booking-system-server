import { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";

export const globalErrorHandler = (err : any , req : Request, res : Response, next : NextFunction) => {
    let StatusCodes = 500;
    let message = `Something Went Wrong !! ${err.message}`
    
    if(err instanceof AppError){
         StatusCodes = err.statusCode
         message = err.message
    } else if(err instanceof Error){
         StatusCodes = 500;
         message = err.message
    }
    res.status(StatusCodes).json({
        success : false,
        message,
        err,
        stack : envVars.NODE_ENV === 'development' ? err.stack : null
    })
}