import { Request, Response, NextFunction } from "express";

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.status(401).json({
            success: false,
            message: "Unauthorized. The route you are trying to reach is only for logged users."
        });
    }
}

export default isAuthenticated;
