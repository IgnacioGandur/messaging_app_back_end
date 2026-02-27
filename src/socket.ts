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
});

const getAllOnlineUsers = async (io: Server) => {
    const sockets = await io.fetchSockets();
    return sockets
        .map(s => s.data.user)
        .filter(user => user !== undefined);
};

io.on("connect", async (socket) => {
    const { userId, profilePictureUrl, username } = socket.handshake.auth;

    if (userId) {
        socket.data.user = { userId, profilePictureUrl, username }; //Attach the user to the data.user object.
        socket.join(userId.toString()); //Create a room for the user using it's id.
        const allUsers = await getAllOnlineUsers(io);
        io.emit("update_user_list", allUsers);
    }

    socket.on("disconnect", async () => {
        const userData = { ...socket.data.user, lastActive: new Date() };

        if (userData?.userId) {
            const now = new Date();
            try {
                await userModel.updateField(userData.userId, "lastActive", now);
                io.emit("user_disconnected", { userId: userData.userId, lastActive: now });
            } catch (error) {
                console.error("Failed when trying to update the 'lastActive' field when logging user out.");
            };
        };

        const allUsers = await getAllOnlineUsers(io);
        io.emit("update_user_list", allUsers);
    });
});
