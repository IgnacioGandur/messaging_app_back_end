import test_client from "./test_client.js";
import client from "./client.js";
import { type PrismaClient, type Prisma, Participant } from "../generated/prisma/index.js";

type ConversationWithParticipantsAndMessages = Prisma.ConversationGetPayload<{
    include: {
        participants: true,
        messages: true
    }
}>;

class Conversation {
    prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async getPrivateConversation(userAId: string | number, userBId: string | number) {
        try {
            const conversation = await this.prisma.conversation.findFirst({
                where: {
                    isGroup: false,
                    participants: {
                        every: {
                            userId: {
                                in: [
                                    Number(userAId),
                                    Number(userBId),
                                ]
                            },
                        },
                    },
                }
            });

            return conversation;
        } catch (error) {
            console.error("Prisma error:", error);
            throw new Error("Something went wrong when trying to get a private conversation.");
        }
    }

    async createPrivateConversation(
        userAId: string | number,
        userBId: string | number,
        message: string
    ) {
        try {
            const conversation = await this.prisma.conversation.create({
                data: {
                    isGroup: false,
                    participants: {
                        create: [
                            { userId: Number(userAId) },
                            { userId: Number(userBId) },
                        ]
                    },
                    messages: {
                        create: {
                            senderId: Number(userAId),
                            content: message
                        }
                    },
                },
                include: {
                    participants: {
                        include: {
                            user: {
                                omit: {
                                    password: true
                                }
                            }
                        }
                    },
                    messages: true
                }
            });

            return conversation;
        } catch (error) {
            console.error("Prisma error:", error);
            throw new Error("Something went wrong when trying to create a private conversation.");
        }
    }

    async getAllUserPrivateConversations(userId: number | string): Promise<ConversationWithParticipantsAndMessages[]> {
        try {
            const conversations = await this.prisma.conversation.findMany({
                where: {
                    isGroup: false,
                    participants: {
                        some: {
                            userId: Number(userId),
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
                            }
                        }
                    },
                    messages: {
                        take: 1,
                        orderBy: {
                            createdAt: "desc"
                        }
                    }
                }
            });

            return conversations;
        } catch (error) {
            console.error("Prisma error:", error);
            throw new Error("Something went wrong when trying to get all user's private conversation.")
        }
    }

    async getPrivateConversationById(id: number | string): Promise<null | ConversationWithParticipantsAndMessages> {
        try {
            const conversation = await this.prisma.conversation.findUnique({
                where: {
                    isGroup: false,
                    id: Number(id),
                },
                include: {
                    participants: {
                        include: {
                            user: {
                                omit: {
                                    password: true
                                }
                            }
                        }
                    },
                    messages: {
                        orderBy: {
                            createdAt: "asc"
                        }
                    }
                },
            });

            return conversation;
        } catch (error) {
            console.error("Prisma error:", error);
            throw new Error("Something went wrong when trying to get a conversation by it's id.");
        }
    }
}

export default new Conversation(process.env.NODE_ENV === "test" ? test_client : client);
