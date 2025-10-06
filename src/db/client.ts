import { PrismaClient } from "../generated/prisma/index.js";

const client = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    }
});

export default client;
