import mongoose from "mongoose";
const Schema = mongoose.Schema;

const messageSchema = new Schema(
	{
		data: {
			text: String,
			files: [String],
		},
		read: Boolean,
		from: { type: Schema.Types.ObjectId, ref: "User" },
		to: { type: Schema.Types.ObjectId, ref: "User" },
		conversation: { type: Schema.Types.ObjectId, ref: "Conversation" },
		deletedFor: [{ type: Schema.Types.ObjectId, ref: "User" }],
	},
	{
		timestamps: true,
	}
);

export default mongoose.model("Message", messageSchema);
