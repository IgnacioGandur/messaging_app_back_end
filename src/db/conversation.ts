import test_client from "./test_client.js";
import client from "./client.js";
import { type PrismaClient, type Prisma } from "../generated/prisma/index.js";

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
                    AND: [
                        {
                            participants: {
                                some: {
                                    userId: Number(userAId),
                                }
                            }
                        },
                        {
                            participants: {
                                some: {
                                    userId: Number(userBId),
                                }
                            }
                        },
                    ]
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
        const conversation = await this.prisma.conversation.create({
            data: {
                lastMessageAt: new Date(),
                ownerId: Number(userAId),
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

        // const conversation = await this.prisma.conversation.create({
        //     data: {
        //         ownerId: Number(userAId),
        //         isGroup: false,
        //         participants: {
        //             create: [
        //                 { userId: Number(userAId) },
        //                 { userId: Number(userBId) },
        //             ]
        //         },
        //         messages: {
        //             create: {
        //                 senderId: Number(userAId),
        //                 content: message
        //             }
        //         },
        //     },
        //     include: {
        //         participants: {
        //             include: {
        //                 user: {
        //                     omit: {
        //                         password: true
        //                     }
        //                 }
        //             }
        //         },
        //         messages: true
        //     }
        // });

        // return conversation;
    }

    async getUserConversations(
        userId: number | string,
        search: string
    ): Promise<{
        conversations: ConversationWithParticipantsAndMessages[],
        count: number
    }> {
        const where: Prisma.ConversationWhereInput = {
            participants: {
                some: {
                    userId: Number(userId)
                },
            },
            ...(search && {
                OR: [
                    {
                        title: {
                            contains: search,
                            mode: "insensitive"
                        }
                    },
                    {
                        participants: {
                            some: {
                                user: {
                                    username: {
                                        contains: search,
                                        mode: "insensitive"
                                    }
                                },
                                NOT: {
                                    userId: Number(userId)
                                }
                            }
                        }
                    }
                ]
            })
        };

        const [conversations, count] = await this.prisma.$transaction([
            this.prisma.conversation.findMany({
                where,
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
                },
                orderBy: {
                    lastMessageAt: "desc"
                }
            }),

            this.prisma.conversation.count({
                where
            }),
        ]);

        return {
            conversations,
            count
        };
    }

    async getPrivateConversationById(
        id: number | string,
    ): Promise<null | ConversationWithParticipantsAndMessages> {
        const conversation = await this.prisma.conversation.findUnique({
            where: {
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
                    include: {
                        attachments: true,
                        sender: true,
                    },
                    orderBy: {
                        createdAt: "desc"
                    },
                    take: 15 + 1,
                },
            },
        });
        return conversation;
    }
}

export default new Conversation(process.env.NODE_ENV === "test" ? test_client : client);
