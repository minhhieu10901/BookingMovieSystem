import express from 'express';
import { getAllUsers, signup, updateUser, deleteUser, login } from '../controllers/user-controller.js';

const userRouter = express.Router();

userRouter.get("/", getAllUsers);
userRouter.post("/signup", signup );
userRouter.put("/:id", updateUser);// update user by id
userRouter.delete("/:id", deleteUser);// delete user by id
userRouter.post("/login", login); // login user
export default userRouter;