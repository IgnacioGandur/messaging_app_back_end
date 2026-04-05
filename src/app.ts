import express from "express";
import router from "./routes/router.js";
import session from "express-session";
import passport from "passport";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import { PrismaClient } from "./generated/prisma/index.js";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
    session({
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 Days cookie.
            secure: false,
            httpOnly: true,
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        },
        secret: String(process.env.SESSION_SECRET),
        resave: false,
        saveUninitialized: false,
        store: new PrismaSessionStore(
            new PrismaClient({
                datasources: {
                    db: {
                        url:
                            process.env.NODE_ENV === "test"
                                ? process.env.TEST_DATABASE_URL
                                : process.env.DATABASE_URL,
                    },
                },
            }),
            {
                checkPeriod: 1000 * 60 * 4,
                dbRecordIdIsSessionId: false,
                dbRecordIdFunction: undefined,
            },
        ),
    }),
);
app.use(passport.initialize());
app.use(passport.session());

import "./middlewares/passport/passport.js";

app.use(router);

export default app;
