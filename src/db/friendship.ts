import client from "./client.js";
import test_client from "./test_client.js";
import type { PrismaClient, Prisma } from "../generated/prisma/client.js";

class Friendship {
    prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma
    };

    async getFriends(
        userId: number | string,
        filter: "ACCEPTED",
        pageSize: number,
        skip: number,
        search: string
    ) {
        try {
            const where: Prisma.FriendshipWhereInput = {
                status: filter,
                OR: [
                    {
                        userAId: Number(userId),
                        userB: {
                            username: {
                                contains: search,
                                mode: "insensitive"
                            }
                        }
                    },
                    {
                        userBId: Number(userId),
                        userA: {
                            username: {
                                contains: search,
                                mode: "insensitive"
                            }
                        }
                    },
                ],
            };

            const [friends, friendsCount] = await this.prisma.$transaction([
                this.prisma.friendship.findMany({
                    where,
                    skip: Number(skip),
                    take: Number(pageSize),
                    orderBy: {
                        createdAt: "desc"
                    },
                    include: {
                        userA: {
                            omit: {
                                password: true
                            }
                        },
                        userB: {
                            omit: {
                                password: true
                            }
                        }
                    }
                }),

                this.prisma.friendship.count({
                    where
                })
            ]);

            return {
                friends,
                friendsCount
            };

        } catch (error) {
            console.error("Prisma error:", error);
            throw new Error("Something went wrong when trying to get the accepted friendships.");
        }
    }

    async getUserFriendships(
        userId: number | string,
        filter: "ACCEPTED" | "PENDING" | undefined
    ) {
        try {
            const friendships = await this.prisma.friendship.findMany({
                where: {
                    status: filter,
                    OR: [
                        {
                            userAId: Number(userId)
                        },
                        {
                            userBId: Number(userId)
                        },
                    ]
                }
            });

            return friendships;
        } catch (error) {
            console.error("Prisma error:", error);
            throw new Error("Something went wrong when trying to get all user friendships.");
        }
    }

    async createFriendship(
        userAId: number | string,
        userBId: number | string,
    ) {
        try {
            const friendship = await this.prisma.friendship.create({
                data: {
                    userAId: Number(userAId),
                    userBId: Number(userBId),
                }
            });

            return friendship;
        } catch (error) {
            console.error("Prisma error:", error);
            throw new Error("Something went wrong when trying to create a friendship.");
        }
    }

    async delete(
        id: number | string
    ) {
        try {
            const friendship = await this.prisma.friendship.delete({
                where: {
                    id: Number(id)
                }
            });

            return friendship;
        } catch (error) {
            console.error("Prisma error:", error);
            throw new Error("Something went wrong when trying to delete a friendship.");
        }
    }

    async getPendingFriendships(
        userAId: string | number,
    ) {
        try {
            const friendships = await this.prisma.friendship.findMany({
                where: {
                    status: "PENDING",
                    userBId: Number(userAId)
                },
                include: {
                    userA: true,
                }
            });

            return friendships;
        } catch (error) {
            console.error("Prisma error:", error);
            throw new Error("Something went wrong when tryint to get pending friendships.");
        }
    }

    async handleFriendshipResponse(
        friendshipId: number | string,
        status: "ACCEPTED" | "PENDING"
    ) {
        try {
            const friendship = await this.prisma.friendship.update({
                where: {
                    id: Number(friendshipId),
                    status: "PENDING",
                },
                data: {
                    status,
                }
            });

            return friendship;
        } catch (error) {
            console.error("Prisma error:", error);
            throw new Error("Something went wrong when trying to handle the friendship response.");
        }
    }

    async getFriendshipById(
        id: string | number
    ) {
        try {
            const friendship = await this.prisma.friendship.findUnique({
                where: {
                    id: Number(id)
                }
            });

            return friendship;
        } catch (error) {
            console.error("Prisma error:", error);
            throw new Error("Something went wrong when trying to get a friendship by it's id.");
        }
    }

    async getFriendshipByParticipants(
        userAId: number | string,
        userBId: number | string,
    ) {
        try {
            const friendship = await this.prisma.friendship.findFirst({
                where: {
                    OR: [
                        { userAId: Number(userAId), userBId: Number(userBId) },
                        { userAId: Number(userBId), userBId: Number(userAId) },
                    ],
                }
            });

            return friendship;
        } catch (error) {
            console.error("Prisma error:", error);
            throw new Error("Something went wrong when trying to get a friendship by it's participants.");
        }
    }
}

export default new Friendship(process.env.NODE_ENV === "test" ? test_client : client);
