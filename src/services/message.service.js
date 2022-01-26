import Message from "../models/message.model.js";
import { addConversationMessage } from "./conversation.service.js";
import Conversation from "../models/conversation.model.js";

export const createMessage = async ({ text, from, to, conversation }) => {
	const message = new Message({
		data: {
			text,
			files: [],
		},
		read: false,
		from,
		to,
		conversation: conversation._id,
	});

	try {
		const saved = await message.save();
		return { message: saved.toObject(), conversation };
	} catch (e) {
		console.log(e.message);
		return e;
	}
};

export const deleteConversation = async ({ messageId, deleteForUserId }) => {
	return await Message.findOneAndUpdate(
		{ _id: messageId },
		{
			$push: { deleteFor: deleteForUserId },
		},
		{ new: true, useFindAndModify: false }
	);
};

export const readMessages = async (conversationId, from) => {
	return await Message.updateMany(
		{ conversation: conversationId, read: false, from },
		{ read: true }
	);
};
