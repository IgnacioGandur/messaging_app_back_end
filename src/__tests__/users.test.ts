import { describe, it, expect, beforeEach } from "vitest";
import supertest from "supertest";
import app from "../app.js";
import deleteAllUsers from "./utilities/deleteAllUsers.js";
import getTestUser from "./utilities/getTestUser.js";
import createTestUser from "./utilities/createTestUser.js";

beforeEach(async () => {
    await deleteAllUsers();
});

describe("Users Route.", () => {
    it("GET | Should retrieve all users.", async () => {
        const response = await supertest(app)
            .get("/users")
            .expect(200)
            .expect("Content-Type", /json/);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("All users retrieved successfully!");
        expect("users" in response.body).toBe(true);
    });

    it("PATCH | Should update the currently logged user.", async () => {
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

        const user = await getTestUser("john_doe");

        const response = await agent
            .patch(`/users/${user!.id}`)
            .send({
                firstName: "updatedJohn",
                lastName: "updatedDoe",
                password: "new_pass",
                confirmPassword: "new_pass",
                profilePictureUrl: "https://images3.alphacoders.com/529/thumb-1920-52905.jpg"
            })
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("User updated successfully!");
        expect("updatedUser" in response.body).toBe(true);
        expect(response.body.updatedUser.firstName).toBe("updatedJohn");
        expect(response.body.updatedUser.lastName).toBe("updatedDoe");
        expect(response.body.updatedUser.profilePictureUrl).toBe("https://images3.alphacoders.com/529/thumb-1920-52905.jpg");
    });

    it("PATCH | Should fail the update due to bad inputs provided.", async () => {
        const agent = supertest.agent(app);

        await createTestUser(
            "jane_doe",
            "jane",
            "doe",
            "bla"
        );

        await agent
            .post("/auth/register")
            .type("form")
            .send({
                firstName: "john",
                lastName: "doe",
                username: "john_doe",
                password: "bla",
                confirmPassword: "bla"
            })
            .expect(200);

        const user = await getTestUser("jane_doe");

        const response = await agent
            .patch(`/users/${user!.id}`)
            .send({
                username: "!invalid username",
                firstName: "invalid first name !123",
                lastName: "!invalid last name 123",
                password: "a"
            })
            .expect(422);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("There's something wrong with the following inputs, please correct them:");
        expect("errors" in response.body).toBe(true);
        expect(response.body.errors.some((error: { msg: string }) => error.msg === "You are not the owner of the account your are trying to update.")).toBe(true);
        expect(response.body.errors.some((error: { msg: string }) => error.msg === "The first name field should only contain letters.")).toBe(true);
        expect(response.body.errors.some((error: { msg: string }) => error.msg === "The last name field should only contain letters.")).toBe(true);
        expect(response.body.errors.some((error: { msg: string }) => error.msg === "The password should be at least 5 characters long.")).toBe(true);
    });

    it("DELETE | Should delete a user.", async () => {
        const agent = supertest.agent(app);

        await agent
            .post("/auth/register")
            .type("form")
            .send({
                firstName: "john",
                lastName: "doe",
                username: "john_doe",
                password: "bla",
                confirmPassword: "bla"
            })
            .expect(200);

        const user = await getTestUser("john_doe");

        const response = await agent
            .delete(`/users/${user?.id}`)
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("User deleted successfully!");
        expect("user" in response.body).toBe(true);

        const userAfterDeletion = await getTestUser("Ignacio");

        expect(userAfterDeletion).toBe(null);
    });

    it("DELETE | Should fail deleting a user account due to not being account owner.", async () => {
        await createTestUser(
            "john_doe",
            "john",
            "doe",
            "bla",
        );

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

        const user = await getTestUser("john_doe");

        const response = await agent
            .delete(`/users/${user!.id}`)
            .expect(422);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("There's something wrong with the following inputs, please correct them:");
        expect("errors" in response.body).toBe(true);
        expect(response.body.errors.some((error: { msg: string }) => error.msg === "You are not the owner of the account your are trying to update.")).toBe(true);
    })
});
