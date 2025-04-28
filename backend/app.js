import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRouter from './routes/user-routes.js';
import adminRouter from './routes/admin-routes.js';
import movieRouter from './routes/movie_routes.js';
import bookingsRouter from './routes/booking-routers.js';


dotenv.config();
const app = express();

// Middleware
app.use(express.json()); // Parse JSON bodies (as sent by API clients)
app.use("/user", userRouter);
app.use("/admin", adminRouter);
app.use("/movie", movieRouter);
app.use("/booking", bookingsRouter);

mongoose
    .connect(
        `mongodb+srv://admin:${process.env.MONGODB_PASSWORD}@cluster0.ybyraah.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
    )
    .then(() =>
        app.listen(5000, () =>
            console.log("Connected To Database and Server started is running on port 5000")
        )
    )
    .catch((e) => console.log(e));



// YX4S0xNxeiiBWU3v