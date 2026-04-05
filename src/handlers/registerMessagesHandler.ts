import { Prisma } from "../generated/prisma/client.js";
import { Server, Socket } from "socket.io";

export type MessagePayload = Prisma.MessageGetPayload<{
    include: {
        conversation: {
            include: {
                participants: true;
            };
        };
    };
}>;

const registerMessagesHandler = (_io: Server, socket: Socket) => {
    const sendMessage = (payload: MessagePayload) => {
        const { participants } = payload.conversation;
        participants.forEach((p) => {
            socket.to(p.userId.toString()).emit("message:receive", payload);
        });
    };

    socket.on("message:send", sendMessage);
};

export default registerMessagesHandler;
