import test_client from "./test_client.js";
import client from "./client.js";
import type { Prisma, PrismaClient } from "@prisma/client";

type ConversationWithParticipantsAndMessages = Prisma.ConversationGetPayload<{
    include: {
        participants: true;
        messages: true;
    };
}>;

class Conversation {
    prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async getPrivateConversation(
        userAId: string | number,
        userBId: string | number,
    ) {
        try {
            const conversation = await this.prisma.conversation.findFirst({
                where: {
                    isGroup: false,
                    AND: [
                        {
                            participants: {
                                some: {
                                    userId: Number(userAId),
                                },
                            },
                        },
                        {
                            participants: {
                                some: {
                                    userId: Number(userBId),
                                },
                            },
                        },
                    ],
                },
                include: {
                    participants: true,
                },
            });

            return conversation;
        } catch (error) {
            console.error("Prisma error:", error);
            throw new Error(
                "Something went wrong when trying to get a private conversation.",
            );
        }
    }

    async createPrivateConversation(
        userAId: string | number,
        userBId: string | number,
        message: string,
    ) {
        const conversation = await this.prisma.conversation.create({
            data: {
                lastMessageAt: new Date(),
                ownerId: Number(userAId),
                isGroup: false,
                participants: {
                    create: [
                        { userId: Number(userAId) },
                        { userId: Number(userBId) },
                    ],
                },
                messages: {
                    create: {
                        senderId: Number(userAId),
                        content: message,
                    },
                },
            },
            include: {
                participants: {
                    include: {
                        user: {
                            omit: {
                                password: true,
                            },
                        },
                    },
                },
                messages: {
                    include: {
                        sender: {
                            omit: {
                                password: true,
                            },
                        },
                    },
                },
            },
        });

        return conversation;
    }

    async getUserConversations(
        userId: number | string,
        search: string,
        take?: string | number,
    ): Promise<{
        conversations: ConversationWithParticipantsAndMessages[];
        count: number;
    }> {
        const where: Prisma.ConversationWhereInput = {
            participants: {
                some: {
                    userId: Number(userId),
                    listVisible: true,
                },
            },
            ...(search && {
                OR: [
                    {
                        title: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                    {
                        participants: {
                            some: {
                                user: {
                                    username: {
                                        contains: search,
                                        mode: "insensitive",
                                    },
                                },
                                NOT: {
                                    userId: Number(userId),
                                },
                            },
                        },
                    },
                ],
            }),
        };

        const [conversations, count] = await this.prisma.$transaction([
            this.prisma.conversation.findMany({
                where,
                include: {
                    participants: {
                        include: {
                            user: {
                                omit: {
                                    password: true,
                                },
                            },
                        },
                    },
                    messages: {
                        take: 1,
                        orderBy: {
                            createdAt: "desc",
                        },
                    },
                },
                ...(take && {
                    take: Number(take),
                }),
                orderBy: {
                    lastMessageAt: "desc",
                },
            }),

            this.prisma.conversation.count({
                where,
                ...(take && {
                    take: Number(take),
                }),
            }),
        ]);

        return {
            conversations,
            count,
        };
    }

    async getPrivateConversationById(
        userId: number | string,
        conversationId: number | string,
    ): Promise<null | ConversationWithParticipantsAndMessages> {
        return await this.prisma.$transaction(async (tx) => {
            const uId = Number(userId);
            const cId = Number(conversationId);
            const participant = await tx.participant.findUnique({
                where: {
                    userId_conversationId: {
                        userId: uId,
                        conversationId: cId,
                    },
                },
                select: {
                    lastDeletedAt: true,
                },
            });

            if (!participant) return null;

            const boundaryDate = participant.lastDeletedAt || new Date(0);

            return await tx.conversation.findUnique({
                where: {
                    id: cId,
                },
                include: {
                    participants: {
                        include: {
                            user: {
                                omit: {
                                    password: true,
                                },
                            },
                        },
                    },
                    messages: {
                        where: {
                            createdAt: {
                                gt: boundaryDate,
                            },
                        },
                        include: {
                            attachments: true,
                            sender: true,
                        },
                        orderBy: {
                            createdAt: "desc",
                        },
                        take: 15 + 1,
                    },
                },
            });
        });
    }
}

export default new Conversation(
    process.env.NODE_ENV === "test" ? test_client : client,
);
