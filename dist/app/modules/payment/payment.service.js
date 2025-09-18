"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const ride_model_1 = require("../ride/ride.model");
const payment_interface_1 = require("./payment.interface");
const payment_model_1 = require("./payment.model");
//     const session = await Ride.startSession();
//     session.startTransaction()
//     try {
//         const updatedPayment = await Payment.findOneAndUpdate(
//             { transactionId: query.transactionId },
//             { paymentStatus: PAYMENT_STATUS.PAID },
//             { new: true, runValidators: true }
//         ).session(session);
//         if (!updatedPayment) {
//             throw new AppError(401, "Payment not found")
//         }
//         const updatedRide = await Ride.findByIdAndUpdate(
//             updatedPayment?.ride,
//             { status: "PAYMENT_COMPLETE" },
//             { new: true, runValidators: true }
//         ).session(session)
//             .populate("riderId", "name email")
//             .populate("driverId", "name email")
//             .populate("payment");
//         if (!updatedRide) {
//             throw new AppError(401, "Ride not found")
//         }
//         console.log(updatedPayment, updatedRide);
//         await session.commitTransaction(); //transaction
//         session.endSession()
//         return { success: true, message: "Payment Completed Successfully" }
//     } catch (error) {
//         await session.abortTransaction();
//         session.endSession()
//         // throw new AppError(httpStatus.BAD_REQUEST, error) 
//         throw error
//     }
// };
// const successPayment = async (query: Record<string, string>) => {
//   const session = await Ride.startSession();
//   session.startTransaction();
//   try {
//    const transactionId = query.tran_id || query.transactionId;
//     console.log(transactionId);
//     if (!transactionId) {
//       throw new AppError(400, "Transaction ID missing from query");
//     }
//     // ✅ Update Payment
//      await Payment.findOneAndUpdate(
//       { transactionId }, // unified transactionId
//       { paymentStatus: PAYMENT_STATUS.PAID },
//       { new: true, runValidators: true, session }
//     );
//     // // Update Ride
//     // const updatedRide = await Ride.findByIdAndUpdate(
//     //   updatedPayment.ride,
//     //   { status: "PAYMENT_COMPLETE" },
//     //   { new: true, runValidators: true }
//     // )
//     //   .session(session)
//     //   .populate("riderId", "name email")
//     //   .populate("driverId", "name email")
//     //   .populate("payment");
//     // if (!updatedRide) {
//     //   throw new AppError(401, "Ride not found");
//     // }
//     await session.commitTransaction();
//     session.endSession();
//     return { success: true, message: "Payment Completed Successfully" };
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     throw error;
//   }
// };
const successPayment = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield ride_model_1.Ride.startSession();
    session.startTransaction();
    try {
        // ✅ Update Payment
        const updatedPayment = yield payment_model_1.Payment.findOneAndUpdate({ transactionId: query.transactionId }, {
            status: payment_interface_1.PAYMENT_STATUS.PAID,
        }, { new: true, runValidators: true, session: session });
        if (!updatedPayment) {
            throw new AppError_1.default(404, "Payment not found");
        }
        // ✅ Update Ride
        // const updatedRide = await Ride.findByIdAndUpdate(
        //   updatedPayment.ride,
        //   { status: "PAYMENT_COMPLETE", payment: updatedPayment._id },
        //   { new: true, runValidators: true, session }
        // )
        //   .populate("riderId", "name email")
        //   .populate("driverId", "name email")
        //   .populate("payment");
        // if (!updatedRide) {
        //   throw new AppError(404, "Ride not found");
        // }
        yield session.commitTransaction();
        session.endSession();
        return { success: true, message: "Payment Completed Successfully" };
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
exports.PaymentService = {
    successPayment
};
