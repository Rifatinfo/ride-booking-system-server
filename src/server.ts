import { Server } from 'http';
import mongoose from "mongoose";
import app from './app';

let server: Server;

const startServer = async () => {
  try {
    await mongoose.connect("mongodb+srv://ride-booking:UowKd9ub5XLEcksf@cluster0.i1uhr.mongodb.net/Ride-Booking?retryWrites=true&w=majority&appName=Cluster0");
    console.log("Connected To DataBase");

    server = app.listen(5000, () => {
      console.log('Server is Running!!');
    })

  } catch (error) {
    console.log(error);
  }
}

startServer();

process.on("SIGTERM", () => {
  console.log("SIGTERM signal received detected .... Server shut down");

  if (server) {
    server.close(() => {
      process.exit(1);
    })
  }
  process.exit(1);
})
process.on("SIGINT", () => {
  console.log("SIGTERM signal received detected .... Server shut down");

  if (server) {
    server.close(() => {
      process.exit(1);
    })
  }
  process.exit(1);
})

process.on("unhandledRejection", () => {
  console.log("Unhandled Rejection detected.... Server shut down");
  
  if(server){
      server.close(() => {
        process.exit(1)
      })
  }
  process.exit(1)
})
process.on("uncaughtException", () => {
  console.log("uncaughtException  detected.... Server shut down");
  
  if(server){
      server.close(() => {
        process.exit(1)
      })
  }
  process.exit(1)
})