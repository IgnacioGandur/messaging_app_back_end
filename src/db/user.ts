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
        try {
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
        } catch (error) {
            console.error("Prisma error:", error);
            throw new Error("Something went wrong when trying to create a new user.");
        }
    }

    async getUserByUsername(username: string, omitPassword: boolean = false): Promise<UserWithoutPassword | UserType | null> {
        try {
            const user = await this.prisma.user.findUnique({
                where: {
                    username,
                },
                omit: {
                    password: omitPassword,
                }
            });

            return user;
        } catch (error) {
            console.error("Prisma error:", error);
            throw new Error("Something went wrong when trying to get a user by it's username.");
        }
    }

    async getUserById(id: number | string, omitPassword: boolean = false): Promise<UserType | UserWithoutPassword | null> {
        try {
            const user = await this.prisma.user.findUnique({
                where: {
                    id: Number(id),
                },
                omit: {
                    password: omitPassword
                }
            });

            return user;
        } catch (error) {
            console.error("Prisma error:", error);
            throw new Error("Something went wrong when trying to get a user by it's id.");
        }
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

    async updateUser(id: string | number, fields: UpdatableFields): Promise<UserType> {
        try {
            const user = await this.prisma.user.update({
                where: {
                    id: Number(id)
                },
                data: fields
            });

            return user;
        } catch (error) {
            console.error("Prisma error: ", error);
            throw new Error("Something went wrong when trying to update a user.");
        }
    }

    async deleteUser(id: string | number): Promise<UserType> {
        try {
            const user = await this.prisma.user.delete({
                where: {
                    id: Number(id),
                },
            });

            return user;
        } catch (error) {
            console.error("Prisma error:", error);
            throw new Error("Something went wrong when trying to delete a user.");
        }
    }
}

export default new User(process.env.NODE_ENV === "test" ? test_client : client);
