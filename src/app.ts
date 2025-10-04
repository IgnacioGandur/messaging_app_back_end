import express from "express";
import router from "./routes/router.js";
import session from "express-session";
import passport from "passport";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import { PrismaClient } from "./generated/prisma/index.js";

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 Days cookie.
    },
    secret: "random secret",
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(
        new PrismaClient({
            datasources: {
                db: {
                    url: process.env.NODE_ENV === "test" ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL
                }
            }
        }),
        {
            checkPeriod: 1000 * 60 * 4,
            dbRecordIdIsSessionId: false,
            dbRecordIdFunction: undefined
        }
    )
}));
app.use(passport.authenticate("session"));

import "./middlewares/passport/passport.js";

app.use(router);

export default app;
