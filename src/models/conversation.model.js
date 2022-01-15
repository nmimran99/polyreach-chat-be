import mongoose from "mongoose";
const Schema = mongoose.Schema;

const conversationSchema = new Schema(
	{
		participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
		messages: [{ type: Schema.Types.ObjectId, ref: "Message" }],
		deleteFor: [{ type: Schema.Types.ObjectId, ref: "User" }],
		type: String,
		lastMessageAt: Date,
	},
	{
		timestamps: true,
	}
);

export default mongoose.model("Conversation", conversationSchema);
