import mongoose from "mongoose";
const Schema = mongoose.Schema;

const conversationSchema = new Schema(
	{
		participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
		deleteFor: [{ type: Schema.Types.ObjectId, ref: "User" }],
		attributes: {},
	},
	{
		timestamps: true,
	}
);

export default mongoose.model("Conversation", conversationSchema);
