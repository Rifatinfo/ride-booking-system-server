import { Server } from 'http';
import mongoose from "mongoose";
import app from './app';
import { envVars } from './app/config/env';

let server: Server;

const startServer = async () => {
  try {
    await mongoose.connect(envVars.DB_URL);
    console.log("Database Connected");
    
    server = app.listen(envVars.PORT, () => {
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