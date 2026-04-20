import { PrismaClient } from "@prisma/client";
import adapter from "./adapter.js";

const client = new PrismaClient({
    adapter,
});

export default client;
