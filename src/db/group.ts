import test_client from "./test_client.js";
import client from "./client.js";
import { PrismaClient } from "../generated/prisma/index.js";

class Group {
    prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async createGroup(
        profilePictureUrl: string,
        name: string,
        userId: string | number,
    ) {
        try {
            const group = await this.prisma.conversation.create({
                data: {
                    isGroup: true,
                    profilePicture: profilePictureUrl,
                    title: name,
                    participants: {
                        create: {
                            userId: Number(userId),
                            role: "OWNER"
                        },
                    },
                },
            });

            return group;
        } catch (error) {
            console.error("Prisma error:", error);
            throw new Error("Something went wrong whent trying to create a group.");
        }
    }

    async getAll() {
        try {
            const groups = await this.prisma.conversation.findMany({
                where: {
                    isGroup: true,
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

            return groups;
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

    async update(id: number | string, name: string) {
        try {
            const group = await this.prisma.conversation.update({
                where: {
                    id: Number(id),
                },
                data: {
                    title: name,
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
