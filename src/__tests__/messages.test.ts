import { describe, it, expect, beforeEach } from "vitest";
import app from "../app.js";
import supertest from "supertest";
import deleteTestConversations from "./utilities/deleteTestConversations.js";
import deleteAllUsers from "./utilities/deleteAllUsers.js";
import deleteTestMessages from "./utilities/deleteTestMessages.js";
import createTestUser from "./utilities/createTestUser.js";
import createTestPrivateConversation from "./utilities/createTestConversation.js";
import getTestConversationById from "./utilities/getTestConversationById.js";
import { ValidationError } from "express-validator";

beforeEach(async () => {
    await deleteTestConversations();
    await deleteAllUsers();
    await deleteTestMessages();
});


describe("Messages Router.", () => {
    it("POST | Should successfully send a message to an existing conversation.", async () => {
        // Start conversation
        const john = await createTestUser(
            "john_doe",
            "john",
            "doe",
            "bla"
        );

        const jane = await createTestUser(
            "jane_doe",
            "jane",
            "doe",
            "bla"
        );

        const conversation = await createTestPrivateConversation(
            john!.id,
            jane!.id,
            "Hello",
        );

        const agent = supertest.agent(app);

        // Login as John
        await agent
            .post("/auth/login")
            .type("form")
            .send({
                username: "john_doe",
                password: "bla"
            })
            .expect(200);

        const response = await agent
            .post(`/conversations/${conversation!.id}/messages`)
            .type("form")
            .send({
                message: "Response message"
            })

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Message sent successfully!");
        expect("sentMessage" in response.body).toBe(true);

        const updatedConversation = await getTestConversationById(conversation.id);

        expect(updatedConversation?.messages.some((m) => m.content === "Response message")).toBe(true);
    });

    it("POST | Should fail sending a message due to user not being a participant in the conversation.", async () => {
        const john = await createTestUser(
            "john_doe",
            "john",
            "doe",
            "bla",
        );

        const jane = await createTestUser(
            "jane_doe",
            "jane",
            "doe",
            "bla",
        );

        const conversation = await createTestPrivateConversation(
            john!.id,
            jane!.id,
            "Hello from John to Jane.",
        );

        const agent = supertest.agent(app);

        await agent
            .post("/auth/register")
            .type("form")
            .send({
                firstName: "jill",
                lastName: "doe",
                username: "jill_doe",
                password: "bla",
                confirmPassword: "bla",
            })
            .expect(200);

        const response = await agent
            .post(`/conversations/${conversation.id}/messages`)
            .type("form")
            .send({
                message: ""
            })
            .expect(403);

        expect(response.body.success).toBe(false);
        expect("errors" in response.body).toBe(true);
        expect(response.body.errors.some((e: { msg: string }) => e.msg === "You are not a part of this conversation.")).toBe(true);
    });

    it("DELETE | Should successfully delete a message from a conversation.", async () => {
        const john = await createTestUser(
            "john_doe",
            "john",
            "doe",
            "bla",
        );
        const jane = await createTestUser(
            "jane_doe",
            "jane",
            "doe",
            "bla",
        );

        const conversation = await createTestPrivateConversation(
            john!.id,
            jane!.id,
            "First message",
        );

        const agent = supertest.agent(app);

        await agent
            .post("/auth/login")
            .type("form")
            .send({
                username: "john_doe",
                password: "bla"
            })
            .expect(200)
            ;

        const response = await agent
            .delete(`/conversations/${conversation.id}/messages/${conversation.messages[0].id}/`)
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Message deleted successfully!");
        expect("deletedMessage" in response.body).toBe(true);
        expect(response.body.deletedMessage.deleted).toBe(true);
    });

    it("DELETE | Should fail message deletion due to user not being message owner.", async () => {
        const john = await createTestUser(
            "john_doe",
            "john",
            "doe",
            "bla",
        );
        const jane = await createTestUser(
            "jane_doe",
            "jane",
            "doe",
            "bla",
        );

        const conversation = await createTestPrivateConversation(
            john!.id,
            jane!.id,
            "Hello from John to Jane."
        );

        const agent = supertest.agent(app);

        await agent
            .post("/auth/login")
            .type("form")
            .send({
                username: "jane_doe",
                password: "bla",
            })
            .expect(200);

        const response = await agent
            .delete(`/conversations/${conversation!.id}/messages/${conversation!.messages[0].id}`)
            .expect(422);

        expect(response.body.success).toBe(false);
        expect("errors" in response.body).toBe(true);
        expect(response.body.errors.some((e: ValidationError) => e.msg === "Only the message owner can delete the message in this conversation.")).toBe(true);

    });
});
