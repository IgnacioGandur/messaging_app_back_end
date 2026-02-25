import client from "./client.js";
import test_client from "./test_client.js";
import { type PrismaClient, type User as UserType, Prisma } from "../generated/prisma/client.js";

type UserWithoutPassword = Omit<Prisma.UserGetPayload<{}>, "password">;

type UpdatableFields = {
    [key: string]: any;
};

class User {
    prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async createUser(
        firstName: string,
        lastName: string,
        username: string,
        profilePictureUrl: string,
        password: string
    ): Promise<UserType> {
        const user = await this.prisma.user.create({
            data: {
                firstName,
                lastName,
                username,
                profilePictureUrl,
                password,
            }
        });

        return user;
    }

    async getUserByUsername(
        username: string,
        omitPassword: boolean = false
    ) {
        const user = await this.prisma.user.findUnique({
            where: {
                username,
            },
            omit: {
                password: omitPassword,
            }
        });

        return user;
    }

    async getUserById(id: number | string, omitPassword: boolean = false): Promise<UserType | UserWithoutPassword | null> {
        const user = await this.prisma.user.findUnique({
            where: {
                id: Number(id),
            },
            omit: {
                password: omitPassword
            }
        });

        return user;
    }

    async getFullUserProfile(id: number | string) {
        const [user, ownedGroups, friendships, joinedGroups] = await this.prisma.$transaction([
            this.prisma.user.findUnique({
                where: {
                    id: Number(id)
                },
                omit: {
                    password: true
                },
            }),
            this.prisma.conversation.findMany({
                where: {
                    isGroup: true,
                    participants: {
                        some: {
                            userId: Number(id),
                            role: "OWNER"
                        }
                    }
                },
            }),
            this.prisma.friendship.findMany({
                where: {
                    OR: [
                        {
                            userAId: Number(id),
                        },
                        {
                            userBId: Number(id)
                        }
                    ]
                },
                include: {
                    userA: {
                        omit: {
                            password: true
                        }
                    },
                    userB: {
                        omit: {
                            password: true
                        }
                    }
                }
            }),
            this.prisma.conversation.findMany({
                where: {
                    isGroup: true,
                    participants: {
                        some: {
                            userId: Number(id),
                            role: {
                                not: "OWNER"
                            }
                        }
                    }
                },
            })
        ]);

        return {
            user,
            ownedGroups,
            friendships,
            joinedGroups
        };
    }

    async getAllUsers(
        pageSize: number,
        skip: number,
        search: string
    ) {
        try {
            const where: Prisma.UserWhereInput = {
                username: {
                    contains: search,
                    mode: "insensitive"
                }
            };

            const [users, totalCount] = await this.prisma.$transaction([
                this.prisma.user.findMany({
                    where,
                    omit: { password: true },
                    skip: Number(skip),
                    take: Number(pageSize),
                    orderBy: {
                        joinedOn: "desc"
                    }
                }),
                this.prisma.user.count({
                    where
                }),
            ]);

            return {
                users,
                totalCount,
            };
        } catch (error) {
            console.error("Prisma error:", error);
            throw new Error("Something went wrong when trying to get all users.");
        }
    }

    async updateUser(
        id: string | number,
        fields: UpdatableFields
    ): Promise<UserType> {
        const user = await this.prisma.user.update({
            where: {
                id: Number(id)
            },
            data: fields
        });

        return user;
    }

    async deleteUser(userId: string | number) {
        const user = await this.prisma.$transaction(async (tx) => {
            const ownedConversations = await tx.conversation.findMany({
                where: {
                    ownerId: Number(userId)
                },
                include: {
                    participants: {
                        orderBy: {
                            joinedAt: "asc"
                        }
                    }
                }
            });

            // Pass conversation ownership to another user before deleting the user account.
            for (const conv of ownedConversations) {
                if (conv.isGroup) {
                    // New owner would be the oldest user in the conversation.
                    const newOwner = conv.participants.find((p) => p.userId !== Number(userId));

                    if (newOwner) {
                        await tx.conversation.update({
                            where: {
                                id: conv.id
                            },
                            data: {
                                ownerId: newOwner.userId
                            }
                        });

                        await tx.participant.update({
                            where: {
                                userId_conversationId: {
                                    userId: newOwner.userId,
                                    conversationId: conv.id
                                }
                            },
                            data: {
                                role: "OWNER"
                            }
                        });
                    } else {
                        await tx.conversation.delete({
                            where: {
                                id: Number(conv.id)
                            }
                        })
                    }
                }
            };

            return await tx.user.delete({
                where: {
                    id: Number(userId)
                }
            });
        });

        return user;
    }

    async getUserWithStats(
        userId: number | string
    ) {
        const uId = Number(userId);
        return await this.prisma.$transaction([
            this.prisma.user.findUnique({
                where: {
                    id: uId
                },
                omit: {
                    password: true
                }
            }),
            this.prisma.friendship.count({
                where: {
                    OR: [
                        {
                            userAId: uId
                        },
                        {
                            userBId: uId
                        },
                    ],
                    status: "ACCEPTED"
                }
            }),
            this.prisma.participant.count({
                where: {
                    listVisible: true,
                    userId: uId,
                    conversation: {
                        isGroup: false
                    }
                }
            }),
            this.prisma.participant.count({
                where: {
                    listVisible: true,
                    userId: uId,
                    conversation: {
                        isGroup: true
                    }
                }
            }),
            this.prisma.participant.count({
                where: {
                    role: "OWNER",
                    listVisible: true,
                    userId: uId,
                    conversation: {
                        isGroup: true
                    }
                }
            }),
            this.prisma.message.count({
                where: {
                    senderId: uId
                }
            }),
        ]);
    }

    async updateField(
        userId: number | string,
        field: keyof Pick<Prisma.UserUpdateInput, "lastActive" | "firstName" | "lastName" | "password" | "profilePictureUrl">,
        value: Date | string
    ) {
        return await this.prisma.user.update({
            where: {
                id: Number(userId)
            },
            data: {
                [field]: value
            }
        });
    }
}

export default new User(process.env.NODE_ENV === "test" ? test_client : client);
