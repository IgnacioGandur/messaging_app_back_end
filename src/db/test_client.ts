import { PrismaClient } from "../generated/prisma/client.js";

const test_client = new PrismaClient({
    datasources: {
        db: {
            url: process.env.TEST_DATABASE_URL
        }
    }
})

export default test_client;
