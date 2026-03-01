import { Server, Socket } from "socket.io";
import { MessagePayload } from "./registerMessagesHandler.js";

const registerNotificationsHandler = (_io: Server, socket: Socket) => {
    const notifyMessage = (payload: MessagePayload) => {
        const { participants } = payload.conversation;

        participants.forEach((p) => {
            socket
                .to(p.userId.toString())
                .emit("notification:receive_message", payload);
        });
    };

    socket.on("notification:message", notifyMessage);
};

export default registerNotificationsHandler;
