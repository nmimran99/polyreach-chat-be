import { Router } from "express";
import {
	createConversation,
	getConversations,
} from "../services/conversation.service.js";

const router = Router();

router.post("/", createConversation);
router.get("/", getConversations);

export default router;
