import { Request, Response } from "express";
import cors from 'cors';
import express from 'express';

const app = express();

app.use(express.json());
app.use(cors());

// app.use("api/v1", router);
app.get("/", (req : Request, res:Response) => {
    res.status(200).json({
        message : "Welcome to Mongo Node Server"
    })
})

export default app;