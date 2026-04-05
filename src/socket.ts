import app from "./app.js";
import { createServer } from "node:http";
import { Server } from "socket.io";
import userModel from "../src/db/user.js";
import registerFriendshipsHandler from "./handlers/registerFriendshipsHandler.js";
import registerMessagesHandler from "./handlers/registerMessagesHandler.js";
import registerNotificationsHandler from "./handlers/registerNotificationsHandler.js";
import registerConversationsHandler from "./handlers/registerConversationsHandler.js";

export const server = createServer(app);

export const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "DELETE"],
    },
});

const getAllOnlineUsers = async (io: Server) => {
    const sockets = await io.fetchSockets();
    const users = new Map();

    sockets.forEach((s) => {
        const user = s.data.user;

        // Prevent duplicated users if the user has more than 1 window/tab open with his profile.
        if (user && user.userId) {
            users.set(user.userId, user);
        }
    });

    return Array.from(users.values());
};

io.on("connect", async (socket) => {
    const { userId, profilePictureUrl, username } = socket.handshake.auth;

    if (userId) {
        socket.data.user = { userId, profilePictureUrl, username }; //Attach the user to the data.user object.
        socket.join(userId.toString()); //Create a room for the user using it's id.
        const allUsers = await getAllOnlineUsers(io);
        io.emit("update_user_list", allUsers);
    }

    registerFriendshipsHandler(io, socket);
    registerMessagesHandler(io, socket);
    registerNotificationsHandler(io, socket);
    registerConversationsHandler(io, socket);

    socket.on("disconnect", async () => {
        const userData = { ...socket.data.user, lastActive: new Date() };
        if (!userData.userId) return;

        const allSockets = await io.fetchSockets();
        const isStillConnected = allSockets.some(
            (s) => s.data.user?.userId === userData.userId,
        );

        // Update the database only when the socket disconnects
        // (this prevents multiple database trips if a user has multiple tabs/windows and closes them, update the db only in the last disconnection.)
        if (!isStillConnected) {
            const now = new Date();
            try {
                await userModel.updateField(userData.userId, "lastActive", now);
                io.emit("user_disconnected", {
                    userId: userData.userId,
                    lastActive: now,
                });
            } catch (error) {
                console.error(
                    "Failed when trying to update the 'lastActive' field when logging user out.",
                );
            }
        }

        const allUsers = await getAllOnlineUsers(io);
        io.emit("update_user_list", allUsers);
        socket.leave(userData.userId);
    });
});
