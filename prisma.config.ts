import { defineConfig } from "prisma/config";

export default defineConfig({
    schema: "prisma/prisma.schema",
    datasource: {
        url: String(process.env.DATABASE_URL),
    },
});
