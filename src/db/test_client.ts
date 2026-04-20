import { PrismaClient } from "@prisma/client";
import adapter from "./adapter.js";

const test_client = new PrismaClient({
    adapter,
});

export default test_client;
