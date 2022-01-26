import bodyParser from "body-parser";
import cors from "cors";
import "dotenv/config.js";
import express from "express";
import { createServer } from "http";
import mongoose from "mongoose";
import { Server } from "socket.io";
import conversationRoute from "./routes/conversation.route.js";
import {
	addSocketId,
	getUserConversations,
} from "./services/conversation.service.js";
import { createMessage, readMessages } from "./services/message.service.js";
import User from "./models/user.model.js";

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
	const socketId = socket.id;
	await User.findOneAndUpdate({ _id: userId }, { messageSocket: socketId });
	convos.forEach((c) => socket.join(`${c._id}`));

	socket.emit("socketid", { socketId: socket.id });
	socket.emit("userConversations", convos);

	socket.on("send-message", async (msg) => {
		const { message, conversation } = await createMessage(msg);
		socket.join(conversation._id);
		io.to(`${conversation._id}`).emit("receive-message", {
			...message,
			conversation,
		});
	});

	socket.on("add-user", async ({ conversation, userToJoin }) => {
		let userObj = await User.findOne({ _id: userToJoin._id });
		if (userObj) {
			io.to(userObj.messageSocket).emit("request-join", { conversation });
		}
	});

	socket.on("read-messages", ({ conversationId, from }) => {
		readMessages(conversationId, from);
	});

	socket.on("register-conversation", ({ conversationId }) => {
		socket.join(conversationId);
	});
});

app.use("/conversation", conversationRoute);

server.listen(process.env.PORT, () => {
	console.log(`listening on port ${process.env.PORT}`);
});
