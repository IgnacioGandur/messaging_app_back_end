import { Meta } from "express-validator";

const checkIfPasswordsMatch = (password: string, { req }: Meta) => {
    const { confirmPassword } = req.body;

    if (password !== confirmPassword) {
        throw new Error("The password and the confirm password fields don't match.");
    }

    return true;
}

export default checkIfPasswordsMatch;
