import express from 'express';
import { addAdmin, loginAdmin, getAdmins, getAdminById } from '../controllers/admin-controller.js';


const adminRouter = express.Router();

adminRouter.post("/signup", addAdmin); // add admin
adminRouter.post("/login", loginAdmin); //
adminRouter.get("/", getAdmins); //
adminRouter.get("/:id", getAdminById); //

export default adminRouter;