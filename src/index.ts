import { type Request, Response } from "express";
import app from "./app.js";

const PORT = process.env.PORT ?? "3000";

app.get("/", (_req: Request, res: Response) => {
    res.json({
        message: "another",
    })
})

app.listen(PORT, () => {
    console.log(`Running on http://localhost:${PORT}`)
})
