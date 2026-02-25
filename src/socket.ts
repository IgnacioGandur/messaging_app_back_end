import app from "./app.js";
import { createServer } from "node:http";
import { Server } from "socket.io";

export const server = createServer(app);

export const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
})

const onlineUsers = new Map();

io.on("connect", (socket) => {
    const { userId, username, profilePictureUrl } = socket.handshake.auth;

    if (userId) {
        onlineUsers.set(socket.id, { userId, username, profilePictureUrl });
        io.emit("update_user_list", Array.from(onlineUsers.values()));
        console.log(`User: ${username} is online.`);
    };

    socket.on("disconnect", () => {
        const user = onlineUsers.get(socket.id);
        if (user) {
            onlineUsers.delete(socket.id);
            io.emit("update_user_list", Array.from(onlineUsers.values()));
            console.log("User disconnected: ", socket.id);
        };
    });
});
