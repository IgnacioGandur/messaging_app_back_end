import { Server, Socket } from "socket.io";
import { MessagePayload } from "./registerMessagesHandler.js";
import { Conversation, Participant } from "@prisma/client";

interface ConversationPayload extends Conversation {
    participants: Participant[];
    recipientId: number;
}

const registerNotificationsHandler = (_io: Server, socket: Socket) => {
    const notifyMessage = (payload: MessagePayload) => {
        const { participants } = payload.conversation;

        participants.forEach((p) => {
            socket
                .to(p.userId.toString())
                .emit("notification:receive_message", payload);
        });
    };

    const messageFromProfile = (payload: ConversationPayload) => {
        const { recipientId } = payload;

        socket
            .to(recipientId.toString())
            .emit("notification:receive_message_from_profile", payload);
    };

    socket.on("notification:message", notifyMessage);
    socket.on("notification:message_from_profile", messageFromProfile);
};

export default registerNotificationsHandler;
