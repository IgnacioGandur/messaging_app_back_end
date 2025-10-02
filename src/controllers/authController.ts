import { type Request, Response } from "express";

const authController = {
    register: async (req: Request, res: Response) => {
        try {
            const {
                username,
                password
            } = req.body;

            return res.json({
                success: true,
                message: "User registered successfully!",
                user: {
                    username,
                    password
                },
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Server error. We were not able to register a new user.",
            });
        }
    }
}

export default authController;
