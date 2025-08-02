import { Server } from 'http';
import mongoose from "mongoose";
import app from './app';

let server : Server;

const startServer = async () => {
    try{
      await mongoose.connect("mongodb+srv://ride-booking:UowKd9ub5XLEcksf@cluster0.i1uhr.mongodb.net/Ride-Booking?retryWrites=true&w=majority&appName=Cluster0");
      console.log("Connected To DataBase");

      server = app.listen(5000, () => {
        console.log('Server is Running');
      })
    } catch(error){
        console.log(error);
    }
}

startServer();