import { Prisma } from "../generated/prisma/index.js";
import type { Server, Socket } from "socket.io";

type Friendship = Prisma.FriendshipSelect;

interface Payload {
    userBId: number;
    friendship: Friendship;
};

const registerFriendshipRequests = (
    io: Server,
    socket: Socket
) => {
    const sendFriendshipRequest = (payload: Payload) => {
        io
            .to(payload.userBId.toString())
            .emit("friendship:received_request", payload.friendship);
    };

    const cancelFriendship = (payload: Friendship) => {
        if (payload && payload.userBId) {
            io
                .to(payload.userBId.toString())
                .emit("friendship:cancel", payload);
        };
    };

    const acceptFriendship = (payload: Friendship) => {
        if (payload && payload.userAId) {
            io
                .to(payload.userAId.toString())
                .emit("friendship:request_accepted", payload);
        };
    };

    const removeFriendship = (payload: Friendship) => {
        if (payload && payload.userAId && payload.userBId) {
            io
                .to(payload.userAId.toString())
                .to(payload.userBId.toString())
                .emit("friendship:remove_friend", payload);
        };
    };

    socket.on("friendship:send_request", sendFriendshipRequest);
    socket.on("friendship:cancel_request", cancelFriendship);
    socket.on("friendship:accept", acceptFriendship);
    socket.on("friendship:remove", removeFriendship);
};

export default registerFriendshipRequests;
