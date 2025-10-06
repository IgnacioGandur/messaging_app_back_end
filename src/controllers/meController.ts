import { Request, Response } from "express";

const meController = {
    getLoggedUserInfo: (req: Request, res: Response) => {
        console.log("request to me route");
        return res.json({
            success: true,
            message: "Logged user info retrieved successfully!",
            user: req.user
        });
    }
}

export default meController;
