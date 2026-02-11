import test_client from "./test_client.js";
import client from "./client.js";
import { PrismaClient, Prisma } from "../generated/prisma/index.js";

class Group {
    prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async createGroup(
        profilePictureUrl: string,
        title: string,
        description: string,
        userId: string | number,
    ) {
        try {
            const group = await this.prisma.conversation.create({
                data: {
                    isGroup: true,
                    profilePicture: profilePictureUrl,
                    description,
                    title,
                    participants: {
                        create: {
                            userId: Number(userId),
                            role: "OWNER"
                        },
                    },
                    messages: {
                        create: {
                            content: `Hello guys, welcome to my group ${title}, please keep the messages cordial!`,
                            senderId: Number(userId)
                        }
                    }
                },
            });

            return group;
        } catch (error) {
            console.error("Prisma error:", error);
            throw new Error("Something went wrong whent trying to create a group.");
        }
    }

    async getAll(
        pageSize: number,
        skip: number,
        search: string,
        yourGroups: boolean,
        userId: number | string,
        joined: boolean
    ) {
        try {
            const where: Prisma.ConversationWhereInput = {
                isGroup: true,
                title: {
                    contains: search,
                    mode: "insensitive"
                },
                ...((yourGroups && userId) && {
                    participants: {
                        some: {
                            role: "OWNER",
                            userId: Number(userId),
                        }
                    }
                }),
                ...((joined && userId) && {
                    participants: {
                        some: {
                            userId: Number(userId),
                            OR: [
                                { role: "USER" },
                                { role: "ADMIN" }
                            ],
                        }
                    }
                })
            };

            const [groups, count] = await this.prisma.$transaction([
                this.prisma.conversation.findMany({
                    where,
                    skip: Number(skip),
                    take: Number(pageSize),
                    orderBy: {
                        createdAt: "desc"
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
                        }
                    }
                }),
                this.prisma.conversation.count({
                    where
                })
            ]);

            return {
                groups,
                count
            };
        } catch (error) {
            console.error("Prisma error:", error);
            throw new Error("Something went wrong when trying to get all groups.");
        }
    }

    async join(groupId: string | number, userId: string | number) {
        try {
            const participant = await this.prisma.participant.create({
                data: {
                    userId: Number(userId),
                    conversationId: Number(groupId),
                },
            });

            return participant;
        } catch (error) {
            console.error("Prisma error:", error);
            throw new Error("Something went wrong when trying join a group.");
        }
    }

    async update(
        id: number | string,
        title: string,
        description: string,
        ppf: string
    ) {
        try {
            const group = await this.prisma.conversation.update({
                where: {
                    id: Number(id),
                },
                data: {
                    title,
                    description,
                    profilePicture: ppf
                },
            });

            return group;
        } catch (error) {
            console.error("Prisma error:", error);
            throw new Error("Something went wrong when trying to update a group.");
        }
    }

    async getById(id: string | number) {
        try {
            const group = await this.prisma.conversation.findUnique({
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
                    }
                }
            });

            return group;
        } catch (error) {
            console.error("Prisma error:", error);
            throw new Error("Something went wrong when trying to get a group by it's id.");
        }
    }

    async delete(id: string | number) {
        try {
            const group = await this.prisma.conversation.delete({
                where: {
                    isGroup: true,
                    id: Number(id),
                },
            });

            return group;
        } catch (error) {
            console.error("Prisma error:", error);
            throw new Error("Something went wrong when trying to delete a group.");
        }
    }
}

export default new Group(process.env.NODE_ENV === "test" ? test_client : client);
