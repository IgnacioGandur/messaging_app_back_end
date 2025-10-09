import { describe, it, expect, beforeEach } from "vitest";
import supertest from "supertest";
import app from "../app.js";
import deleteAllUsers from "./utilities/deleteAllUsers.js";
import getTestUser from "./utilities/getTestUser.js";

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
                username: "Ignacio",
                password: "bla",
                confirmPassword: "bla"
            })
            .expect(200);

        const user = await getTestUser("Ignacio");

        const response = await agent
            .patch(`/users/${user!.id}`)
            .send({
                firstName: "John",
                lastName: "Doe",
                username: ""
            })
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("User updated successfully!");
        expect("updatedUser" in response.body).toBe(true);
        expect(response.body.updatedUser.username).toBe("Ignacio");
        expect(response.body.updatedUser.firstName).toBe("John");
        expect(response.body.updatedUser.lastName).toBe("Doe");
    });

    it("PATCH | Should fail the update due to bad inputs provided.", async () => {
        const agent = supertest.agent(app);

        await agent
            .post("/auth/register")
            .type("form")
            .send({
                username: "Ignacio",
                password: "bla",
                confirmPassword: "bla"
            })
            .expect(200);

        const user = await getTestUser("Ignacio");

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
        expect(response.body.errors[0].msg).toBe("The first name field should only contain letters.");
        expect(response.body.errors[1].msg).toBe("The last name field should only contain letters.");
        expect(response.body.errors[2].msg).toBe("The username field can only contain letters, numbers, dots and hyphens.");
        expect(response.body.errors[3].msg).toBe("The password should be at least 5 characters long.");
    });

    it("DELETE | Should delete a user.", async () => {
        const agent = supertest.agent(app);

        await agent
            .post("/auth/register")
            .type("form")
            .send({
                username: "Ignacio",
                password: "bla",
                confirmPassword: "bla"
            })
            .expect(200);

        const user = await getTestUser("Ignacio");

        const response = await agent
            .delete(`/users/${user?.id}`)
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("User deleted successfully!");
        expect("user" in response.body).toBe(true);

        const userAfterDeletion = await getTestUser("Ignacio");

        expect(userAfterDeletion).toBe(null);
    });
});
