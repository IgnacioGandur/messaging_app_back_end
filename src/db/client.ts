import { PrismaClient } from "../generated/prisma/index.js";
import adapter from "./adapter.js";

const client = new PrismaClient({
    adapter,
});

export default client;
