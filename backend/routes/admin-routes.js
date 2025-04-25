import express from 'express';
import { addAdmin } from '../controllers/admin-controller.js';

const adminRouter = express.Router();

adminRouter.post("/signup", addAdmin ); // add admin

export default adminRouter;