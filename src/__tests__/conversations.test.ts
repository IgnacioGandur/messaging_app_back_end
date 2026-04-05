import { describe, it, expect, beforeEach } from "vitest";
import app from "../app.js";
import supertest from "supertest";
import deleteAllUsers from "./utilities/deleteAllUsers.js";
import createTestUser from "./utilities/createTestUser.js";
import getTestUser from "./utilities/getTestUser.js";
import deleteTestConversations from "./utilities/deleteTestConversations.js";
import deleteTestMessages from "./utilities/deleteTestMessages.js";
import createTestPrivateConversation from "./utilities/createTestConversation.js";

beforeEach(async () => {
    await deleteAllUsers();
    await deleteTestConversations();
    await deleteTestMessages();
});

describe("Conversations Route.", () => {
    it("GET | Should retrieve all user conversations.", async () => {
        const agent = supertest.agent(app);

        await agent.post("/auth/register").type("form").send({
            firstName: "john",
            lastName: "doe",
            username: "john_doe",
            password: "bla",
            confirmPassword: "bla",
        });

        const john = await getTestUser("john_doe");

        const jane = await createTestUser("jane_doe", "jane", "doe", "bla");

        const jill = await createTestUser("jill_doe", "jane", "doe", "bla");

        await createTestPrivateConversation(
            john!.id,
            jane.id,
            "hello from john to jane",
        );

        await createTestPrivateConversation(
            john!.id,
            jill.id,
            "hello from john to jill",
        );

        const response = await agent.get("/conversations").expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe(
            "User conversations retrieved successfully!",
        );
        expect("conversations" in response.body).toBe(true);
        expect(response.body.conversations.length).toBe(2);
    });

    it("GET | Should get a conversation by it's id.", async () => {
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

        const john = await getTestUser("john_doe");
        const jane = await createTestUser("jane_doe", "jane", "doe", "bla");
        const jill = await createTestUser("jill_doe", "jill", "doe", "bla");

        const conversation1 = await createTestPrivateConversation(
            john!.id,
            jane!.id,
            "Hello from john to jane.",
        );

        await createTestPrivateConversation(
            john!.id,
            jill!.id,
            "Hello from john to jill.",
        );

        const response = await agent
            .get(`/conversations/${conversation1.id}`)
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe(
            "Private conversation retrieved successfully!",
        );
        expect("conversation" in response.body).toBe(true);

        // The converastion should contain the correct message.
        expect(
            response.body.conversation.messages.some(
                (m: { content: string }) =>
                    m.content === "Hello from john to jane.",
            ),
        ).toBe(true);
    });

    it("GET | Should fail retrieving a conversation due to user not being a participant.", async () => {
        const jane = await createTestUser("jane_doe", "jane", "doe", "bla");
        const jill = await createTestUser("jill_doe", "jill", "doe", "bla");

        const conversation = await createTestPrivateConversation(
            jane!.id,
            jill!.id,
            "Hello from Jane to Jill!",
        );

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

        const response = await agent
            .get(`/conversations/${conversation.id}`)
            .expect(403);

        expect(response.body.success).toBe(false);
        expect("errors" in response.body).toBe(true);
        expect(
            response.body.errors.some(
                (e: { msg: string }) =>
                    e.msg === "You are not a part of this conversation.",
            ),
        );
    });

    it("POST | Should create a private conversation between two users.", async () => {
        await createTestUser("john_doe", "john", "doe", "bla");

        const john_doe = await getTestUser("john_doe");

        const agent = supertest.agent(app);

        await agent
            .post("/auth/register")
            .type("form")
            .send({
                firstName: "jane",
                lastName: "doe",
                username: "jane_doe",
                password: "bla",
                confirmPassword: "bla",
            })
            .expect(200);

        const jane_doe = await getTestUser("jane_doe");

        const response = await agent
            .post("/conversations")
            .type("form")
            .send({
                recipientId: john_doe!.id,
                message: "Sample message!",
            })
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe(
            "Conversation created successfully!",
        );
        expect("conversation" in response.body).toBe(true);

        // Both users  are part of the conversation.
        expect(
            response.body.conversation.participants.some(
                (p: { userId: string | number }) => p.userId === john_doe!.id,
            ),
        ).toBe(true);
        expect(
            response.body.conversation.participants.some(
                (p: { userId: string | number }) => p.userId === jane_doe!.id,
            ),
        ).toBe(true);

        // The sended message should exist.
        expect(
            response.body.conversation.messages.some(
                (m: { content: string }) => m.content === "Sample message!",
            ),
        ).toBe(true);
    });

    it("POST | Should fail creating a private conversation due to recipient not existing.", async () => {
        const agent = supertest.agent(app);
        await agent
            .post("/auth/register")
            .type("form")
            .send({
                firstName: "jane",
                lastName: "doe",
                username: "jane_doe",
                password: "bla",
                confirmPassword: "bla",
            })
            .expect(200);

        const response = await agent
            .post("/conversations")
            .type("form")
            .send({
                recipientId: "not_valid",
                message: "",
            })
            .expect(422);

        expect(response.body.success).toBe(false);
        expect("errors" in response.body).toBe(true);
        expect(
            response.body.errors.some(
                (e: { msg: string }) =>
                    e.msg === "The recipient id field should be an integer.",
            ),
        ).toBe(true);
        expect(
            response.body.errors.some(
                (e: { msg: string }) =>
                    e.msg === "The message field can't be empty.",
            ),
        ).toBe(true);
    });
});
