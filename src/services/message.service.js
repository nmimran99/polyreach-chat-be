import Message from "../models/message.model.js";
import { addConversationMessage } from "./conversation.service.js";

export const createMessage = async ({
	tenant,
	text,
	from,
	to,
	conversation,
}) => {
	const message = new Message({
		tenant,
		data: {
			text,
			files: [],
		},
		read: false,
		from,
		to,
		conversation,
	});

	try {
		const saved = await message.save();
		await addConversationMessage({
			conversationId: conversation,
			messageId: saved._id,
		});
		return saved;
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
