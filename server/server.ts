import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './src/app';
import config from  './src/config/index';
import { setupSwagger } from "../server/src/swagger";
import express from 'express';

dotenv.config();

setupSwagger(app as express.Express);

(async ()=> {
    try {
       await mongoose.connect(config.DATABASE_URL)
       console.log("DATABASE CONNECTED SUCCESSFULLY")

       app.on('error', (error) => {
              console.error("ERROR :",error)
              throw error;
       })
       
       app.listen(config.PORT, () => {
           console.log(`Server is Listening on http://localhost:${config.PORT}`)
       })

    } catch (error) {
        console.error("ERROR :",error)
        throw error;
    }
})()