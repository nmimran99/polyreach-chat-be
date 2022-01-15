import { Router } from "express";
import { createConversation } from "../services/conversation.service.js";

const router = Router();

router.post("/", createConversation);

export default router;
