import express from "express";
import { addTicket, getAllTickets, getTicketById, updateTicket, deleteTicket } from "../controllers/ticket-controller.js";
import { verifyToken } from "../middleware/auth.js";

const ticketRouter = express.Router();

// Public routes
ticketRouter.get("/", getAllTickets);
ticketRouter.get("/:id", getTicketById);

// Protected routes (admin only)
ticketRouter.post("/", verifyToken, addTicket);
ticketRouter.put("/:id", verifyToken, updateTicket);
ticketRouter.delete("/:id", verifyToken, deleteTicket);

export default ticketRouter; 