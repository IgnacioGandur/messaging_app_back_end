import { Server, Socket } from "socket.io";
import { Prisma } from "../generated/prisma/index.js";

interface ConversationPayload
    extends Prisma.ConversationGetPayload<{
        include: {
            participants: {
                include: {
                    user: {
                        omit: {
                            password: true;
                        };
                    };
                };
            };
            messages: true;
        };
    }> {}

const registerConversationsHandler = (io: Server, socket: Socket) => {
    const handleConversationUpdate = (payload: ConversationPayload) => {
        const { participants } = payload;

        participants.forEach((p) => {
            socket
                .to(p.userId.toString())
                .emit("conversations:update_conversation", payload);
        });
    };

    socket.on("conversations:update", handleConversationUpdate);
};

export default registerConversationsHandler;
