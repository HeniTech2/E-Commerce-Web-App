import express from "express";
import chatWithAssistant from "../controllers/chatController.js";

const chatRouter = express.Router();

chatRouter.post("/message", chatWithAssistant);

export default chatRouter;