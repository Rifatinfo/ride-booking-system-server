import { Request, Response } from "express";
import { catchAsync } from "../../middlewares/catchAsync";
import { PaymentService } from "./payment.service";
import { envVars } from "../../config/env";

const successPayment = catchAsync(async (req: Request, res: Response) => {
    const query = req.query
    const result = await PaymentService.successPayment(query as Record<string, string>)
    console.log(result);
   
    if (result.success) {
        res.redirect(`${envVars.SSL_SUCCESS_FRONTEND_URL}?transactionId=${query.transactionId}&message=${result.message}&amount=${query.amount}&status=${query.status}`)
    }
});

export const PaymentController = {
    successPayment,
};