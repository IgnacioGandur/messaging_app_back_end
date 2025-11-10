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
}

export default new Participant(process.env.NODE_ENV === "test" ? test_client : client);
