import type { PrismaClient } from "../generated/prisma/client.js";
import client from "./client.js";
import test_client from "./test_client.js";

class Participant {
    prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async updateAdminStatus(
        conversationId: number | string,
        userId: number | string,
        role: "ADMIN" | "USER",
    ) {
        try {
            const participant = await this.prisma.participant.update({
                where: {
                    userId_conversationId: {
                        conversationId: Number(conversationId),
                        userId: Number(userId),
                    }
                },
                data: {
                    role
                }
            });

            return participant;
        } catch (error) {
            console.error("Prisma error:", error);
            throw new Error("Something went wrong when trying to toggle the admin status of a group participant.");
        }
    }

    async getGroupParticipantById(
        groupId: string | number,
        userId: string | number,
    ) {
        try {
            const participant = await this.prisma.participant.findUnique({
                where: {
                    userId_conversationId: {
                        userId: Number(userId),
                        conversationId: Number(groupId)
                    }
                }
            });

            return participant;
        } catch (error) {
            console.error("Prisma error:", error);
            throw new Error("Something went wrong when trying to get a group participant by it's id.");
        }
    }

    async removeParticipantFromGroup(
        conversationId: number | string,
        userId: number | string,
    ) {
        try {
            const participant = await this.prisma.participant.delete({
                where: {
                    userId_conversationId: {
                        userId: Number(userId),
                        conversationId: Number(conversationId)
                    }
                }
            });

            return participant;
        } catch (error) {
            console.error("Prisma error:", error);
            throw new Error("Something went wrong whent tryint to remove a participant from a group conversation.");
        }
    }

    async leaveGroup(
        conversationId: number | string,
        userId: number | string
    ) {
        const cId = Number(conversationId);
        const uId = Number(userId);

        return await this.prisma.$transaction(async (tx) => {
            // Get all participants from conversation.
            const participants = await tx.participant.findMany({
                where: {
                    conversationId: cId,
                },
                orderBy: {
                    joinedAt: "asc"
                }
            });

            if (participants.length === 0) return null;

            // Get the user leaving.
            const userLeaving = participants.find((p) => p.userId === uId);

            if (!userLeaving) throw new Error("User not in conversation.");

            // Delete the conversation if the user leaving is the only one in group.
            if (participants.length === 1) {
                return await tx.conversation.delete({
                    where: {
                        id: cId
                    }
                })
            };

            // If user leaving group is group owner, pass ownership to next oldest user.
            if (userLeaving.role === "OWNER") {
                const nextOwner = participants.find(p => p.userId !== uId);
                if (nextOwner) {
                    await tx.participant.update({
                        where: {
                            userId_conversationId: {
                                userId: nextOwner.userId,
                                conversationId: cId
                            }
                        },
                        data: {
                            role: "OWNER"
                        }
                    })
                }
            }

            return await tx.participant.delete({
                where: {
                    userId_conversationId: {
                        userId: uId,
                        conversationId: cId
                    }
                }
            })
        });
    }
}

export default new Participant(process.env.NODE_ENV === "test" ? test_client : client);
