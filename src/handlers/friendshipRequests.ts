import type { Server, Socket } from "socket.io";

const handleFriendshipRequests = (
    io: Server,
    socket: Socket
) => {
    const sendFriendshipRequest = (payload: number) => {
        console.log("friendship sent");
        console.log("the content of payload is:", payload);
    };

    socket.on("friendship:send_request", sendFriendshipRequest);
};

export default handleFriendshipRequests;
