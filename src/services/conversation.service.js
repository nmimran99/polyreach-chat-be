import Conversation from "../models/conversation.model.js";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";

export const createConversation = async (req, res) => {
	const { participants } = req.body;

	try {
		const conv = await Conversation.find({
			participants: { $all: participants },
		});

		if (conv.length) {
			res.status(200).send({ conversation: conv });
			return;
		}

		const conversation = new Conversation({
			participants,
			atributes: {},
			deleteFor: [],
		});

		let savedConv = await conversation.save();
		const saved = await savedConv.populate([
			{
				path: "participants",
				model: "User",
				select: "info avatar data status messageSocket videoSocket",
			},
		]);

		res
			.status(200)
			.send({ conversation: { ...saved.toObject(), messages: [] } });
	} catch (e) {
		console.log(e.message);
		res.status(500).send({ message: e.message });
		return;
	}
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
	let conversations = await Conversation.find({
		participants: userId,
	})
		.populate([
			{
				path: "participants",
				model: "User",
				select: "info avatar data status messageSocket videoSocket",
			},
		])
		.lean();

	let newConvos = await Promise.all(
		conversations.map(async (convo) => {
			const lastMessages = await Message.find({ conversation: convo._id })
				.sort({ createdAt: -1 })
				.limit(15);

			return { ...convo, messages: lastMessages };
		})
	);
	return newConvos;
};

export const getUserConversation = async (conversationId) => {
	return await Conversation.findOne({ conversationId })
		.sort({ lastMessageAt: -1 })
		.populate([
			{
				path: "participants",
				model: "User",
				select: "info avatar data status",
			},
		]);
};
export const getConversations = async (req, res) => {
	const { userId } = req.query;
	try {
		let conversations = await Conversation.find({
			participants: userId,
		})
			.populate([
				{
					path: "participants",
					model: "User",
					select: "info avatar data status messageSocket videoSocket",
				},
			])
			.lean();

		let newConvos = await Promise.all(
			conversations.map(async (convo) => {
				const lastMessages = await Message.find({ conversation: convo._id })
					.sort({ createdAt: -1 })
					.limit(15);

				return { ...convo, messages: lastMessages };
			})
		);
		res.status(200).send({ conversations: newConvos });
	} catch (e) {
		console.log(e.message);
		res.status(500).send({ message: e.message });
		return;
	}
};

export const addSocketId = async (user, socketId) => {
	try {
		const us = await User.findOneAndUpdate(
			{ _id: user },
			{ messageSocket: socketId },
			{ new: true }
		);
		return us;
	} catch (e) {
		console.log(e.message);
	}
};
