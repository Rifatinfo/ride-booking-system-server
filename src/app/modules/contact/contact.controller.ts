import { Request, Response } from "express";
import { catchAsync } from "../../middlewares/catchAsync";
import { sendResponse } from "../../middlewares/sendResponse";
import { StatusCodes } from "http-status-codes";
import { contactService } from "./contact.service";

const handleContactForm = catchAsync(async (req: Request, res: Response) => {
    const {name, email, phone, comName, description} = req.body;
    const result = await contactService.submitContactForm({name, email, phone, comName, description})
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.CREATED,
        message: "Contact from create in Successfully",
        data: result
    })
})

export const contactController = {
    handleContactForm
}