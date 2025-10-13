import { describe, it, expect, beforeEach } from "vitest";
import supertest from "supertest";
import app from "../app.js";
import deleteAllUsers from "./utilities/deleteAllUsers.js";
import createTestUser from "./utilities/createTestUser.js";
import getTestUser from "./utilities/getTestUser.js";
import deleteTestConversations from "./utilities/deleteTestConversations.js";

describe("Conversations Router", async () => {
    beforeEach(async () => {
        await deleteAllUsers();
        await deleteTestConversations();
    });

    it("POST | Should create a new conversation between 2 users.", async () => {
        const agent = supertest.agent(app);
        await createTestUser("Ignacio", "bla");
        await createTestUser("JohnDoe", "bla");

        await agent
            .post("/auth/login")
            .type("form")
            .send({
                username: "Ignacio",
                password: "bla"
            })
            .expect(200);

        const userB = await getTestUser("JohnDoe");

        const response = await agent
            .post("/conversations")
            .type("form")
            .send({
                userBId: userB?.id,
            })
            .expect(200)
            .expect("Content-Type", /json/);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Conversation created successfully!");
        expect("conversation" in response.body).toBe(true);
    });

    it("POST | Should successfully send a message.", async () => {
        const agent = supertest(app);

        await createTestUser("Ignacio", "bla");
        await createTestUser("JohnDoe", "bla");

        await agent
            .post("/auth/login")
            .type("form")
            .send({
                username: "Ignacio",
                password: "bla"
            })
            .expect(200);

    });
});
