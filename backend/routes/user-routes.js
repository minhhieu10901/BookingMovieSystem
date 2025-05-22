import express from 'express';
import { getAllUsers, signup, updateUser, deleteUser, login, getBookingsOfUser, getUserById } from '../controllers/user-controller.js';

const userRouter = express.Router();

userRouter.get("/", getAllUsers);
userRouter.get("/:id", getUserById); // get user by id
userRouter.post("/signup", signup);
userRouter.put("/:id", updateUser);// update user by id
userRouter.delete("/:id", deleteUser);// delete user by id
userRouter.post("/login", login); // login user
userRouter.get("/bookings/:id", getBookingsOfUser); // get bookings by user id
export default userRouter;