import client from "./client.js";
import test_client from "./test_client.js";
import { PrismaClient } from "../generated/prisma/index.js";

class Message {
    prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async create(
        conversationId: number | string,
        content: string,
        senderId: string | number
    ) {
        try {
            const [message] = await this.prisma.$transaction([
                this.prisma.message.create({
                    data: {
                        content,
                        senderId: Number(senderId),
                        conversationId: Number(conversationId)
                    },
                    include: {
                        sender: {
                            omit: {
                                password: true
                            }
                        },
                        conversation: {
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
                        }
                    }
                    // include: {
                    //     conversation: {
                    //         select: {
                    //             participants: {
                    //                 select: {
                    //                     userId: true
                    //                 }
                    //             },
                    //             isGroup: true,
                    //             title: true,
                    //             profilePicture: true
                    //         },
                    //     },
                    //     sender: true
                    // }
                }),
                this.prisma.conversation.update({
                    where: {
                        id: Number(conversationId)
                    },
                    data: {
                        lastMessageAt: new Date(),
                    },
                }),
                this.prisma.participant.updateMany({
                    where: {
                        conversationId: Number(conversationId)
                    },
                    data: {
                        listVisible: true
                    }
                })
            ]);

            return message;
        } catch (error) {
            console.error("Prisma error:", error);
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

    async createWithAttachment(
        conversationId: number | string,
        content: string,
        senderId: number | string,
        fileName: string,
        fileType: string,
        fileUrl: string
    ) {
        try {
            const [message] = await this.prisma.$transaction([
                this.prisma.message.create({
                    data: {
                        conversationId: Number(conversationId),
                        content,
                        senderId: Number(senderId),
                        attachments: {
                            create: {
                                fileName,
                                fileType,
                                fileUrl,
                            },
                        },
                    },
                    include: {
                        attachments: {
                            select: {
                                id: true
                            }
                        },
                        conversation: {
                            include: {
                                participants: true
                            }
                        },
                        sender: {
                            select: {
                                firstName: true,
                                lastName: true,
                                profilePictureUrl: true
                            }
                        }
                    }
                }),
                this.prisma.conversation.update({
                    where: {
                        id: Number(conversationId),
                    },
                    data: {
                        lastMessageAt: new Date(),
                    },
                }),
                this.prisma.participant.updateMany({
                    where: {
                        conversationId: Number(conversationId),
                    },
                    data: {
                        listVisible: true,
                    }
                })
            ]);

            return message;
        } catch (error) {
            console.error("Prisma error:", error);
            throw new Error("Something went wrong when trying to create a message with attachment.");
        }
    }

    async getMoreMessages(
        conversationId: number | string,
        limit: number | string,
        cursorId: number | string,
    ) {
        try {
            const messages = await this.prisma.message.findMany({
                where: {
                    conversationId: Number(conversationId),
                },
                take: Number(limit) + 1,
                cursor: cursorId ? { id: Number(cursorId) } : undefined,
                skip: cursorId ? 1 : 0,
                include: {
                    attachments: true,
                    sender: true,
                },
                orderBy: {
                    createdAt: "desc"
                },
            });

            return messages;
        } catch (error) {
            console.error("Prisma error:", error);
            throw new Error("Something went wrong when trying to get more messages.");
        }
    }
};

export default new Message(process.env.NODE_ENV === "test" ? test_client : client);
