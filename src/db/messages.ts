import client from "./client.js";
import test_client from "./test_client.js";
import { PrismaClient } from "../generated/prisma/index.js";

class Message {
    prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async create(conversationId: number | string, content: string, senderId: string | number) {
        try {
            const message = await this.prisma.message.create({
                data: {
                    content,
                    senderId: Number(senderId),
                    conversationId: Number(conversationId)
                }
            });

            return message;
        } catch (error) {
            console.log("Prisma error:", error);
            throw new Error("Something went wrong when trying to create a message.");
        }
    }

    async delete(id: number | string) {
        try {
            const message = await this.prisma.message.update({
                where: {
                    id: Number(id),
                },
                data: {
                    deleted: true
                }
            });

            return message;
        } catch (error) {
            console.error("Prisma error:", error);
            throw new Error("Something went wrong when trying to delete a message.");
        }
    }

    async getById(id: string | number) {
        try {
            const message = await this.prisma.message.findUnique({
                where: {
                    id: Number(id),
                },
            });

            return message;
        } catch (error) {
            console.error("Prisma error:", error);
            throw new Error("Something went wrong when trying to check if a message exists by it's id.");
        }
    }
};

export default new Message(process.env.NODE_ENV === "test" ? test_client : client);
