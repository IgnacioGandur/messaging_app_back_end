import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
    connectionString:
        process.env.NODE_ENV === "test"
            ? process.env.TEST_DATABASE_URL
            : process.env.DATABASE_URL,
});

export default adapter;
