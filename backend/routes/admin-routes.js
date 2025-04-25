import express from 'express';
import { addAdmin, loginAdmin } from '../controllers/admin-controller.js';

const adminRouter = express.Router();

adminRouter.post("/signup", addAdmin ); // add admin
adminRouter.post("/login", loginAdmin ); //
export default adminRouter;