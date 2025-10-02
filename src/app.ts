import express, { type Request, Response } from "express";

const app = express();

app.get("/", (_req: Request, res: Response) => {
    res.json({
        message: "another",
    })
})

export default app;
