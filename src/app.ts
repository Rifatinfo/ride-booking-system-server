import { Request, Response } from "express";
import cors from 'cors';
import express from 'express';
import { router } from "./app/routes";
import { globalErrorHandler } from "./app/middlewares/errorHandler.middleware";
import { notFound } from "./app/middlewares/notFound";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());

app.use(cors({
    origin: ['http://localhost:5173'],
    // origin: ['https://ride-booking-clients.vercel.app'],
    credentials: true
}))
app.use(cookieParser());

app.use("/api", router);

app.get("/", (req : Request, res: Response) => {
    res.status(200).json({
        message : "Welcome to Ride Booking System Server"
    })
})

app.use(globalErrorHandler);
app.use(notFound);

export default app;