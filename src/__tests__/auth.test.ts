import { describe, it, expect, beforeEach } from "vitest";
import supertest from "supertest";
import app from "../app.js";
import deleteAllUsers from "./utilities/deleteAllUsers.js";
import createTestUser from "./utilities/createTestUser.js";

beforeEach(async () => {
    await deleteAllUsers();
});

describe("Auth Router", () => {
    it("POST | Should register a new user.", async () => {
        const response = await supertest(app)
            .post("/auth/register")
            .type("form")
            .send({
                firstName: "john",
                lastName: "doe",
                username: "john_doe",
                password: "bla",
                confirmPassword: "bla",
            })
            .expect(200)
            .expect("Content-Type", /json/);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("User registered successfully!");
        expect("user" in response.body).toBe(true);
        expect(response.body.user.username).toBe("john_doe");
    });

    it("POST | Should fail registering a new user due to bad inputs.", async () => {
        await supertest(app)
            .post("/auth/register")
            .type("form")
            .send({
                firstName: "john",
                lastName: "doe",
                username: "john_doe",
                password: "bla",
                confirmPassword: "bla",
            })
            .expect(200);

        const response = await supertest(app)
            .post("/auth/register")
            .type("form")
            .send({
                firstName: "john",
                lastName: "doe",
                username: "john_doe",
                password: "bla",
                confirmPassword: "ble",
            })
            .expect(422)
            .expect("Content-Type", /json/);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe(
            "There's something wrong with the following inputs, please correct them:",
        );
        expect("errors" in response.body).toBe(true);
        expect(
            response.body.errors.some(
                (obj: { msg: string }) =>
                    obj.msg === "The username: 'john_doe' is already taken.",
            ),
        ).toBe(true);
        expect(
            response.body.errors.some(
                (obj: { msg: string }) =>
                    obj.msg ===
                    "The password and the confirm password fields don't match.",
            ),
        ).toBe(true);
    });

    it("POST | Should successfully login.", async () => {
        await createTestUser("john_doe", "john", "doe", "bla");

        const agent = supertest.agent(app);

        const response = await agent
            .post("/auth/login")
            .type("form")
            .send({
                username: "john_doe",
                password: "bla",
            })
            .expect(200)
            .expect("Content-Type", /json/);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("User logged successfully!");
        expect("user" in response.body).toBe(true);

        // Check if cookie is created after login.
        const cookieRegex = /connect\.sid/gi;
        const cookiesArray = response.header[
            "set-cookie"
        ] as unknown as string[];
        const cookieExists = cookiesArray.some((cookie) =>
            cookie.match(cookieRegex),
        );

        expect(cookieExists).toBe(true);
    });

    it("POST | Should fail to log in due to bad inputs.", async () => {
        await createTestUser("john_doe", "john", "doe", "password");

        const response = await supertest(app)
            .post("/auth/login")
            .type("form")
            .send({
                username: "non_existing_user",
                password: "",
            })
            .expect(422);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe(
            "There's something wrong with the following inputs, please correct them:",
        );
        expect("errors" in response.body).toBe(true);
        expect(response.body.errors[0].msg).toBe(
            "The user with the username: 'non_existing_user' doesn't exist.",
        );
        expect(response.body.errors[1].msg).toBe(
            "The password field can't be empty.",
        );
    });

    it("GET | Should access protected route after login.", async () => {
        const agent = supertest.agent(app);

        await agent
            .post("/auth/register")
            .type("form")
            .send({
                firstName: "john",
                lastName: "doe",
                username: "john_doe",
                password: "bla",
                confirmPassword: "bla",
            })
            .expect(200);

        const response = await agent.get("/auth/protected-route").expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe(
            "Protected route reached! You are authenticated.",
        );
    });

    it("GET | Should fail accessing protected route due to not being logged.", async () => {
        const response = await supertest(app)
            .get("/auth/protected-route")
            .expect(401)
            .expect("Content-Type", /json/);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe(
            "Unauthorized. The route you are trying to reach is only for logged users.",
        );
    });

    it("GET | Should log out the current user.", async () => {
        await createTestUser("john_doe", "john", "doe", "bla");

        const agent = supertest.agent(app);

        await agent
            .post("/auth/login")
            .type("form")
            .send({
                username: "john_doe",
                password: "bla",
            })
            .expect(200);

        const response = await agent.post("/auth/logout").expect(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("User logged out successfully!");

        await agent.get("/auth/protected-route").expect(401);
    });

    it("POST | Should register a new user and automatically log it after register.", async () => {
        const agent = supertest.agent(app);

        const response = await agent
            .post("/auth/register")
            .type("form")
            .send({
                firstName: "john",
                lastName: "doe",
                username: "john_doe",
                password: "bla",
                confirmPassword: "bla",
            })
            .expect(200);

        // Check if cookie is created after login.
        const cookieRegex = /connect\.sid/gi;
        const cookiesArray = response.header[
            "set-cookie"
        ] as unknown as string[];
        const cookieExists = cookiesArray.some((cookie) =>
            cookie.match(cookieRegex),
        );

        expect(cookieExists).toBe(true);

        await agent.get("/auth/protected-route").expect(200);
    });
});
