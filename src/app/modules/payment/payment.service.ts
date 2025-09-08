import AppError from "../../errorHelpers/AppError";
import { Ride } from "../ride/ride.model";
import { PAYMENT_STATUS } from "./payment.interface";
import { Payment } from "./payment.model";


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


const successPayment = async (query: Record<string, string>) => {
  const session = await Ride.startSession();
  session.startTransaction();

  try {

    // ✅ Update Payment
    const updatedPayment = await Payment.findOneAndUpdate(
      { transactionId: query.transactionId }, {
            status: PAYMENT_STATUS.PAID,
        }, { new: true, runValidators: true, session: session }
    );

    if (!updatedPayment) {
      throw new AppError(404, "Payment not found");
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

    await session.commitTransaction();
    session.endSession();

    return { success: true, message: "Payment Completed Successfully" };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};


export const PaymentService = {
    successPayment
};