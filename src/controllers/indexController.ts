import { type Request, Response } from "express";

const indexController = {
    indexGet(_req: Request, res: Response) {
        return res.json({
            success: true,
            message: "Index route reached!",
        })
    }
}

export default indexController;
