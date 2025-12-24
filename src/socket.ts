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

io.on("connect", (socket) => {
    console.log("User connected: ", socket.id);

    socket.on("disconnect", () => {
        console.log("User disconnected: ", socket.id);
    });
});
