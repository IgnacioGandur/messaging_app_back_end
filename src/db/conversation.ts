import test_client from "./test_client.js";
import client from "./client.js";
import { type PrismaClient } from "../generated/prisma/index.js";

class Conversation {
    prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async get(userId: number | string) {
        try {
            const conversations = await this.prisma.conversation.findMany({
                where: {
                    participants: {
                        some: {
                            userId: Number(userId)
                        }
                    }
                },
                include: {
                    participants: {
                        include: {
                            user: {
                                omit: {
                                    password: true
                                }
                            },
                        }
                    },
                    messages: {
                        include: {
                            sender: true
                        }
                    }
                },
            });

            return conversations;
        } catch (error) {
            console.error("Prisma error:", error);
            throw new Error("Something went wrong when trying to get a conversation.");
        }
    }

    async create(userAId: string | number, userBId: string | number, message: string) {
        try {
            const newConversation = await this.prisma.conversation.create({
                data: {
                    participants: {
                        create: [
                            {
                                userId: Number(userAId),
                            },
                            {
                                userId: Number(userBId),
                            },
                        ],
                    },
                    messages: {
                        create: {
                            senderId: Number(userAId),
                            content: message,
                        }
                    }
                },
                include: {
                    participants: true,
                    messages: true
                }
            });

            return newConversation;
        } catch (error) {
            console.error("Prisma error:", error);
            throw new Error("Something went wrong when trying to create a new conversation.");
        }
    }

    async getUserConversations(userId: string | number) {
        try {
            const conversations = await this.prisma.conversation.findMany({
                where: {
                    participants: {
                        some: {
                            userId: Number(userId)
                        }
                    }
                },
                include: {
                    participants: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    username: true,
                                }
                            }
                        }
                    },
                    messages: {
                        orderBy: {
                            createdAt: "desc",
                        },
                        take: 1
                    }
                }
            });

            return conversations;
        } catch (error) {
            console.error("Prisma error:", error);
            throw new Error("Something went wrong when trying to get a user's conversations.");
        }
    }
}

export default new Conversation(process.env.NODE_ENV === "test" ? test_client : client);
