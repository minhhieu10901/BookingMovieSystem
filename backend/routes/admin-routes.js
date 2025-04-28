import express from 'express';
import { addAdmin, loginAdmin, getAdmins } from '../controllers/admin-controller.js';


const adminRouter = express.Router();

adminRouter.post("/signup", addAdmin); // add admin
adminRouter.post("/login", loginAdmin); //
adminRouter.get("/", getAdmins); //
export default adminRouter;