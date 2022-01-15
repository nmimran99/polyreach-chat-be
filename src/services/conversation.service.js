import Conversation from "../models/conversation.model.js";
import User from "../models/user.model.js";

export const createConversation = async (req) => {
	const { tenant, participants, type } = req.body;

	const conv = await Conversation.find({
		participants: { $all: participants },
	});

	if (conv.length) {
		return conv;
	}

	const conversation = new Conversation({
		tenant,
		participants,
		type,
		messages: [],
		deleteFor: [],
		lastMessageAt: new Date(),
	});

	const res = await conversation.save();
	return await res
		.populate([
			{ path: "messages", model: "Message" },
			{ path: "participants", model: "User", select: "info avatar" },
		])
		.execPopulate();
};

export const addConversationMessage = async ({ conversationId, messageId }) => {
	return await Conversation.findOneAndUpdate(
		{ _id: conversationId },
		{
			$push: { messages: messageId },
			lastMessageAt: new Date(),
		},
		{ new: true, useFindAndModify: false }
	);
};

export const deleteConversation = async ({
	conversationId,
	deleteForUserId,
}) => {
	return await Conversation.findOneAndUpdate(
		{ _id: conversationId },
		{
			$push: { deleteFor: deleteForUserId },
		},
		{ new: true, useFindAndModify: false }
	);
};

export const getUserConversations = async (userId) => {
	return await Conversation.find({ participants: userId })
		.sort({ lastMessageAt: -1 })
		.populate([
			{ path: "messages", model: "Message" },
			{ path: "participants", model: "User", select: "info avatar" },
		]);
};

export const getUserConversation = async (conversationId) => {
	return await Conversation.findOne({ conversationId })
		.sort({ lastMessageAt: -1 })
		.populate([
			{ path: "messages", model: "Message" },
			{ path: "participants", model: "User", select: "info avatar" },
		]);
};
