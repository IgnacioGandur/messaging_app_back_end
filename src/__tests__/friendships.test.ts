import app from "../app.js";
import supertest from "supertest";
import { describe, it, expect, beforeEach } from "vitest";
import deleteAllUsers from "./utilities/deleteAllUsers.js";
import createTestUser from "./utilities/createTestUser.js";
import createTestFriendship from "./utilities/createTestFriendship.js";
import { ValidationError } from "express-validator";

beforeEach(async () => {
    await deleteAllUsers();
});

describe("Friendships router", () => {
    it("GET | Should get all friendhips from logged user.", async () => {
        const john = await createTestUser("john", "john", "doe", "bla");

        const jane = await createTestUser("jane", "jane", "doe", "bla");

        await createTestFriendship(john.id, jane.id);

        const agent = supertest.agent(app);

        await agent
            .post("/auth/login")
            .type("form")
            .send({
                username: "john",
                password: "bla",
            })
            .expect(200);

        const response = await agent.get("/friendships").expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe(
            "User friendships retrieved successfully!",
        );
        expect("friendships" in response.body).toBe(true);
    });

    it("POST | Should successfully create a friendship between 2 users.", async () => {
        await createTestUser("john", "john", "doe", "bla");

        const jane = await createTestUser("jane", "jane", "doe", "bla");

        const agent = supertest.agent(app);

        await agent
            .post("/auth/login")
            .type("form")
            .send({
                username: "john",
                password: "bla",
            })
            .expect(200);

        const response = await agent
            .post("/friendships")
            .type("form")
            .send({
                userBId: jane.id,
            })
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Friendship created successfully!");
        expect("friendship" in response.body).toBe(true);
    });

    it("POST | Should fail establishing a friendship due to invalid user B ID.", async () => {
        await createTestUser("john", "john", "doe", "bla");

        await createTestUser("jane", "jane", "doe", "bla");

        const agent = supertest.agent(app);

        await agent
            .post("/auth/login")
            .type("form")
            .send({
                username: "john",
                password: "bla",
            })
            .expect(200);

        const response = await agent
            .post("/friendships")
            .type("form")
            .send({
                userBId: 2000,
            })
            .expect(422);

        expect(response.body.success).toBe(false);
        expect("errors" in response.body).toBe(true);
    });

    it("POST | Should fail creating a friendship due to friendship already existing.", async () => {
        const john = await createTestUser("john", "john", "doe", "bla");
        const jane = await createTestUser("jane", "jane", "doe", "bla");

        await createTestFriendship(john.id, jane.id);

        const agent = supertest.agent(app);

        await agent
            .post("/auth/login")
            .type("form")
            .send({
                username: "john",
                password: "bla",
            })
            .expect(200);

        const response = await agent
            .post("/friendships")
            .type("form")
            .send({
                userBId: jane.id,
            })
            .expect(422);

        expect(response.body.success).toBe(false);
        expect("errors" in response.body).toBe(true);
        expect(
            response.body.errors.some(
                (e: ValidationError) =>
                    e.msg === "This friendship already exists.",
            ),
        ).toBe(true);
    });

    it("PUT | Should successfully accept a friendship request.", async () => {
        const john = await createTestUser("john", "john", "doe", "bla");

        const jane = await createTestUser("jane", "jane", "doe", "bla");

        const friendship = await createTestFriendship(john.id, jane.id);

        const agent = supertest.agent(app);

        await agent
            .post("/auth/login")
            .type("form")
            .send({
                username: "john",
                password: "bla",
            })
            .expect(200);

        const response = await agent
            .put(`/friendships/${friendship.id}`)
            .type("form")
            .send({
                status: "ACCEPTED",
            })
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe(
            "Frienship request handled successfully!",
        );
        expect("friendship" in response.body).toBe(true);
        expect(response.body.friendship.status).toBe("ACCEPTED");
    });

    it("PUT | Should fail handling a friendship request due to user not being in the friendship and invalid status value provided.", async () => {
        const john = await createTestUser("john", "john", "doe", "bla");

        const jane = await createTestUser("jane", "jane", "doe", "bla");

        await createTestUser("jill", "jill", "doe", "bla");

        const friendship = await createTestFriendship(john.id, jane.id);

        const agent = supertest.agent(app);

        await agent
            .post("/auth/login")
            .type("form")
            .send({
                username: "jill",
                password: "bla",
            })
            .expect(200);

        const response = await agent
            .put(`/friendships/${friendship.id}`)
            .type("form")
            .send({
                status: "not valid",
            })
            .expect(422);

        expect(response.body.success).toBe(false);
        expect("errors" in response.body).toBe(true);
        expect(
            response.body.errors.some(
                (e: ValidationError) =>
                    e.msg === "You are not part of this friendship.",
            ),
        ).toBe(true);
        expect(
            response.body.errors.some(
                (e: ValidationError) =>
                    e.msg ===
                    "The only allowed value in the status field is 'ACCEPTED'.",
            ),
        ).toBe(true);
    });

    it("DELETE | Should successfully delete a friendship.", async () => {
        const john = await createTestUser("john", "john", "doe", "bla");

        const jane = await createTestUser("jane", "jane", "doe", "bla");

        const friendship = await createTestFriendship(john.id, jane.id);

        const agent = supertest.agent(app);

        await agent
            .post("/auth/login")
            .type("form")
            .send({
                username: "john",
                password: "bla",
            })
            .expect(200);

        const response = await agent
            .delete(`/friendships/${friendship.id}`)
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Friendship deleted successfully!");
        expect("friendship" in response.body).toBe(true);
    });

    it("DELETE | Should fail deleting a friendship due to user not belonging to friendship.", async () => {
        const john = await createTestUser("john", "john", "doe", "bla");

        const jane = await createTestUser("jane", "jane", "doe", "bla");

        await createTestUser("jill", "jill", "doe", "bla");

        const friendship = await createTestFriendship(john.id, jane.id);

        const agent = supertest.agent(app);

        await agent
            .post("/auth/login")
            .type("form")
            .send({
                username: "jill",
                password: "bla",
            })
            .expect(200);

        const response = await agent
            .delete(`/friendships/${friendship.id}`)
            .expect(422);

        expect(response.body.success).toBe(false);
        expect("errors" in response.body).toBe(true);
        expect(
            response.body.errors.some(
                (e: ValidationError) =>
                    e.msg === "You are not part of this friendship.",
            ),
        ).toBe(true);
    });
});
