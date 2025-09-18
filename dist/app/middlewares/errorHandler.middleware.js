"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const env_1 = require("../config/env");
const AppError_1 = __importDefault(require("../errorHelpers/AppError"));
const globalErrorHandler = (err, req, res, next) => {
    let StatusCodes = 500;
    let message = `Something Went Wrong !! ${err.message}`;
    if (err instanceof AppError_1.default) {
        StatusCodes = err.statusCode;
        message = err.message;
    }
    else if (err instanceof Error) {
        StatusCodes = 500;
        message = err.message;
    }
    res.status(StatusCodes).json({
        success: false,
        message,
        err,
        stack: env_1.envVars.NODE_ENV === 'development' ? err.stack : null
    });
};
exports.globalErrorHandler = globalErrorHandler;
