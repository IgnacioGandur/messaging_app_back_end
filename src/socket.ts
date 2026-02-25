import app from "./app.js";
import { createServer } from "node:http";
import { Server } from "socket.io";
import userModel from "../src/db/user.js";

export const server = createServer(app);

export const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
})

const onlineUsers = new Map();

io.on("connect", async (socket) => {
    const { userId, username, profilePictureUrl, lastActive } = socket.handshake.auth;


    if (userId) {
        onlineUsers.set(socket.id, { userId, username, profilePictureUrl, lastActive });
        io.emit("update_user_list", Array.from(onlineUsers.values()));
        console.log(`User: ${username} is online.`);
    };

    socket.on("disconnect", async () => {
        const user = onlineUsers.get(socket.id);
        if (user) {
            const date = new Date();
            io.emit("user_disconnected", { userId: user.userId, lastActive: date });

            onlineUsers.delete(socket.id);
            io.emit("update_user_list", Array.from(onlineUsers.values()));

            await userModel.updateField(userId, "lastActive", new Date());
            console.log("User disconnected: ", socket.id);
        };
    });
});
