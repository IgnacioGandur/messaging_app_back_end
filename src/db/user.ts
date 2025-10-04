import client from "./client.js";
import test_client from "./test_client.js";
import { type PrismaClient, type User as UserType } from "../generated/prisma/client.js";

class User {
    prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async createUser(username: string, password: string): Promise<UserType> {
        try {
            const user = await this.prisma.user.create({
                data: {
                    username,
                    password,
                }
            });

            return user;
        } catch (error) {
            console.error("Prisma error:", error);
            throw new Error("Something went wrong when trying to create a new user.");
        }
    }

    async getUserByUsername(username: string): Promise<UserType | null> {
        try {
            const user = await this.prisma.user.findUnique({
                where: {
                    username
                }
            });

            return user;
        } catch (error) {
            console.error("Prisma error:", error);
            throw new Error("Something went wrong when trying to get a user by it's username.");
        }
    }

    async getUserById(id: number): Promise<UserType | null> {
        try {
            const user = await this.prisma.user.findUnique({
                where: {
                    id: Number(id),
                },
            });

            return user;
        } catch (error) {
            console.error("Prisma error:", error);
            throw new Error("Something went wrong when trying to get a user by it's id.");
        }
    }
}

export default new User(process.env.NODE_ENV === "test" ? test_client : client);
