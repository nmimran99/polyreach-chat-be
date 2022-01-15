import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import "dotenv/config.js";
import path from "path";
import { createMessage } from "./services/message.service.js";
import conversationRoute from "./routes/conversation.route.js";
import { getUserConversations } from "./services/conversation.service.js";
import Message from "./models/message.model.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(process.cwd() + "/public"));

const server = createServer(app);
const io = new Server(server, {
	cors: {
		origin: "*",
	},
});

mongoose
	.connect(process.env.MONGODB_CONNECTION_STRING, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		autoIndex: false,
	})
	.then(() => console.log("DB Connection established"));

io.sockets.on("connection", async (socket) => {
	const userId = socket.handshake.query.id;
	const convos = await getUserConversations(userId);
	convos.forEach((c) => socket.join(`${c._id}`));
	socket.emit("userConversations", convos);

	socket.on("send-message", async (message) => {
		const msg = await createMessage(message);
		io.to(`${msg.conversation}`).emit("receive-message", msg);
	});

	socket.on("read-messages", async ({ conversationId, sender }) => {
		try {
			const msgs = await Message.updateMany(
				{ conversation: conversationId, read: false, from: sender },
				{ read: true },
				{ new: true }
			);
			io.to(`${conversationId}`).emit("messages-read", `${conversationId}`);
		} catch (e) {
			console.log(e.message);
			io.to(`${conversationId}`).emit("messages-read", null);
		}
	});

	socket.on("create-conversation", ({ conversationId }) => {
		socket.join(conversationId);
	});
});

app.use("/conversation", conversationRoute);

server.listen(process.env.PORT, () => {
	console.log(`listening on port ${process.env.PORT}`);
});
