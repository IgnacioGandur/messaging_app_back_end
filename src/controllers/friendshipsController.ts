import friendshipsModel from "../db/friendship.js";
import type { Request, Response } from "express";

const friendshipsController = {
    getFriendships: async (req: Request, res: Response) => {
        try {
            const { id: userId } = req.user as { id: number };
            const filter = req.query.filter as
                | "ACCEPTED"
                | "PENDING"
                | undefined;

            const page = Number(req.query.page) || 1;
            const pageSize = 10;
            const skip = (page - 1) * pageSize;
            const search = (req.query.search as string) || "";

            if (filter === "PENDING") {
                const friendshipRequests =
                    await friendshipsModel.getPendingFriendships(userId);
                return res.json({
                    success: true,
                    message: "Filtered friendships retrieved successfully!",
                    friendshipRequests,
                });
            }

            if (filter === "ACCEPTED") {
                const { friends, friendsCount } =
                    await friendshipsModel.getFriends(
                        userId,
                        filter,
                        pageSize,
                        skip,
                        search,
                    );

                return res.json({
                    success: true,
                    message: "User friends retrieved successfully!",
                    data: {
                        friends,
                        meta: {
                            friendsCount,
                            totalPages: Math.ceil(friendsCount / pageSize),
                            currentPage: page,
                        },
                    },
                });
            }

            const friendships = await friendshipsModel.getUserFriendships(
                userId,
                filter,
            );
            return res.json({
                success: true,
                message: "User friendships retrieved successfully!",
                friendships,
            });
        } catch (error) {
            console.error("Controller error:", error);
            return res.status(500).json({
                error: true,
                message:
                    "Server error. We were not able to get your friendships.",
            });
        }
    },

    createFriendship: async (req: Request, res: Response) => {
        try {
            const { id: userAId } = req.user as { id: number };
            const { userBId } = req.body;

            const friendship = await friendshipsModel.createFriendship(
                userAId,
                userBId,
            );

            return res.json({
                success: true,
                message: "Friendship created successfully!",
                friendship,
            });
        } catch (error) {
            console.error("Controller error:", error);
            return res.status(500).json({
                error: false,
                message:
                    "Server error. We were not able to create a friendhsip.",
            });
        }
    },

    deleteFriendship: async (req: Request, res: Response) => {
        try {
            const { id } = req.params as { id: string };
            const friendship = await friendshipsModel.delete(id);

            return res.json({
                success: true,
                message: "Friendship deleted successfully!",
                friendship,
            });
        } catch (error) {
            console.error("Controller error:", error);
            return res.status(500).json({
                error: true,
                message:
                    "Server error. We were not able to delete your friendship.",
            });
        }
    },

    handleFriendshipRequest: async (req: Request, res: Response) => {
        try {
            const { id } = req.params as { id: string };
            const { status } = req.body as { status: "ACCEPTED" | "PENDING" };

            const friendship = await friendshipsModel.handleFriendshipResponse(
                id,
                status,
            );

            return res.json({
                success: true,
                message: "Frienship request handled successfully!",
                friendship,
            });
        } catch (error) {
            console.error("Controller error:", error);
            return res.status(500).json({
                error: true,
                message:
                    "Server error. We were not able to respond the friendship request.",
            });
        }
    },
};

export default friendshipsController;
