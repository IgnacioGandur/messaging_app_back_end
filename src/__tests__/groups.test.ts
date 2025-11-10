import { describe, it, expect, beforeEach } from "vitest";
import deleteAllUsers from "./utilities/deleteAllUsers.js";
import deleteTestConversations from "./utilities/deleteTestConversations.js";
import supertest from "supertest";
import app from "../app.js";
import { ValidationError } from "express-validator";
import createTestUser from "./utilities/createTestUser.js";
import createTestGroup from "./utilities/createTestGroup.js";
import addTestUserToTestGroup from "./utilities/addTestUserToTestGroup.js";

beforeEach(async () => {
    await deleteAllUsers();
    await deleteTestConversations(); // This also deletes all groups.
    await deleteTestConversations();
});

describe("Groups router.", () => {
    it("POST | Should successfully create a group.", async () => {
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
            .post("/groups")
            .type("form")
            .send({
                groupName: "first group",
            })
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Group created successfully!");
        expect("group" in response.body).toBe(true);
    });

    it("POST | Should fail group creation due to bad inputs.", async () => {
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
            .post("/groups")
            .type("form")
            .send({
                groupName: ""
            })
            .expect(422);

        expect(response.body.success).toBe(false);
        expect("errors" in response.body).toBe(true);
        expect(response.body.errors.some((e: ValidationError) => e.msg === "The group name field can't be empty.")).toBe(true);
    });

    it("PATCH | Should successfully update a group's name.", async () => {
        const john = await createTestUser(
            "john",
            "john",
            "doe",
            "bla",
        );

        const group = await createTestGroup(
            john!.id,
            "John's group",
        );

        const agent = supertest.agent(app);

        await agent
            .post("/auth/login")
            .type("form")
            .send({
                username: "john",
                password: "bla",
            })
            .expect(200)
            ;

        const response = await agent
            .patch(`/groups/${group.id}`)
            .type("form")
            .send({
                name: "Updated group title."
            })
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Group name updated successfully!");
        expect("group" in response.body).toBe(true);
        expect(response.body.group.title).toBe("Updated group title.");
    });

    it("PATCH | Should fail updating a group due to user not being group owner.", async () => {
        const john = await createTestUser(
            "john",
            "john",
            "doe",
            "bla",
        );

        const group = await createTestGroup(
            john.id,
            "John's group",
        );

        const agent = supertest.agent(app);

        await agent
            .post("/auth/register")
            .type("form")
            .send({
                firstName: "jane",
                lastName: "doe",
                username: "jane",
                password: "bla",
                confirmPassword: "bla",
            })
            .expect(200)
            ;

        const response = await agent
            .patch(`/groups/${group.id}`)
            .type("form")
            .send({
                name: ""
            })

        expect(response.body.success).toBe(false);
        expect("errors" in response.body).toBe(true);
        expect(response.body.errors.some((e: ValidationError) => e.msg === "Only the owner of the group can perform this action."));
        expect(response.body.errors.some((e: ValidationError) => e.msg === "The updated group name can't be empty."));
    });

    it("DELETE | Should successfully delete a group.", async () => {
        const agent = supertest.agent(app);

        const john = await createTestUser(
            "john",
            "john",
            "doe",
            "bla"
        );

        await agent
            .post("/auth/login")
            .type("form")
            .send({
                username: "john",
                password: "bla"
            })
            .expect(200);

        const group = await createTestGroup(
            john.id,
            "John's group",
        );

        const response = await agent
            .delete(`/groups/${group.id}`)
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Group deleted successfully!");
        expect("group" in response.body).toBe(true);
    });

    it("DELETE | Should fail deleting a group due to user not being group owner and bad inputs.", async () => {
        const john = await createTestUser(
            "john",
            "john",
            "doe",
            "bla",
        );

        const group = await createTestGroup(
            john.id,
            "John's group."
        );

        const agent = supertest.agent(app);

        await agent
            .post("/auth/register")
            .type("form")
            .send({
                firstName: "jane",
                lastName: "doe",
                username: "jane",
                password: "bla",
                confirmPassword: "bla",
            })
            .expect(200);

        const response = await agent
            .delete(`/groups/${group.id}`)
            .expect(422);

        expect(response.body.success).toBe(false);
        expect("errors" in response.body).toBe(true);
        expect(response.body.errors.some((e: ValidationError) => e.msg === "Only the owner of the group can perform this action.")).toBe(true);
    });

    it("POST | Should successfully join a group.", async () => {
        const john = await createTestUser(
            "john",
            "john",
            "doe",
            "bla",
        );

        await createTestUser(
            "jane",
            "jane",
            "doe",
            "bla",
        );

        const group = await createTestGroup(
            john.id,
            "John's group."
        );

        const agent = supertest.agent(app);

        await agent
            .post("/auth/login")
            .type("form")
            .send({
                username: "jane",
                password: "bla"
            })

        const response = await agent
            .post(`/groups/${group.id}`)
            .type("form")
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Successfully joined to the group.");
        expect("participant" in response.body).toBe(true);
    });

    it("POST | Should fail joining a group due to user already being a participant.", async () => {
        const john = await createTestUser(
            "john",
            "john",
            "doe",
            "bla",
        );

        await createTestUser(
            "jane",
            "jane",
            "doe",
            "bla",
        );

        const group = await createTestGroup(
            john.id,
            "John's group."
        );

        const agent = supertest.agent(app);

        await agent
            .post("/auth/login")
            .type("form")
            .send({
                username: "jane",
                password: "bla"
            })
            .expect(200);

        await agent
            .post(`/groups/${group.id}`)
            .type("form")
            .expect(200);

        const response = await agent
            .post(`/groups/${group.id}`)
            .type("form")
            .expect(422);

        expect(response.body.success).toBe(false);
        expect("errors" in response.body).toBe(true);
        expect(response.body.errors.some((e: ValidationError) => e.msg === "You are already a participant in this group.")).toBe(true);
    });

    it("PUT | Should successfully give admin role to group participant.", async () => {
        const john = await createTestUser(
            "john",
            "john",
            "doe",
            "bla",
        );

        const jane = await createTestUser(
            "jane",
            "jane",
            "doe",
            "bla",
        );

        const group = await createTestGroup(
            john.id,
            "John's group",
        );

        await addTestUserToTestGroup(
            group.id,
            jane.id
        );

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
            .put(`/groups/${group.id}/participants`)
            .send({
                userId: jane.id,
                role: "ADMIN"
            });

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("User role updated successfully!");
        expect("participant" in response.body).toBe(true);
        expect(response.body.participant.role).toBe("ADMIN");
    });

    it("PUT | Should remove ADMIN role from ADMIN user.", async () => {
        const john = await createTestUser(
            "john",
            "john",
            "doe",
            "bla",
        );
        const jane = await createTestUser(
            "jane",
            "jane",
            "doe",
            "bla",
        );

        const group = await createTestGroup(
            john.id,
            "John's group"
        );

        await addTestUserToTestGroup(
            group.id,
            jane.id
        );

        const agent = supertest.agent(app);

        await agent
            .post("/auth/login")
            .type("form")
            .send({
                username: "john",
                password: "bla",
            })
            .expect(200);

        await agent
            .put(`/groups/${group.id}/participants`)
            .send({
                userId: jane.id,
                role: "ADMIN"
            })
            .expect(200);

        const response = await agent
            .put(`/groups/${group.id}/participants`)
            .send({
                userId: jane.id,
                role: "USER"
            })
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("User role updated successfully!");
        expect("participant" in response.body).toBe(true);
        expect(response.body.participant.role).toBe("USER");
    });

    it("PUT | Should fail giving ADMIN privileges to user due to user not being group participant.", async () => {
        const john = await createTestUser(
            "john",
            "john",
            "doe",
            "bla",
        );
        const jane = await createTestUser(
            "jane",
            "jane",
            "doe",
            "bla",
        );

        const group = await createTestGroup(
            john.id,
            "John's group"
        );

        const agent = supertest.agent(app);

        await agent
            .post("/auth/login")
            .type("form")
            .send({
                username: "john",
                password: "bla"
            })
            .expect(200);

        const response = await agent
            .put(`/groups/${group.id}/participants`)
            .send({
                userId: jane.id,
                role: "NOT VALID ROLE"
            })
            .expect(422);

        expect(response.body.success).toBe(false);
        expect("errors" in response.body).toBe(true);
        expect(response.body.errors.some((e: ValidationError) => e.msg === "The user you are trying to give admin privileges to is not a part of the group."))
        expect(response.body.errors.some((e: ValidationError) => e.msg === "The participant role field can only be 'USER' or 'ADMIN'."))
    });

    it("DELETE | Should successfully remove a participant from a group.", async () => {
        const john = await createTestUser(
            "john",
            "john",
            "doe",
            "bla",
        );
        const jane = await createTestUser(
            "jane",
            "jane",
            "doe",
            "bla",
        );

        const group = await createTestGroup(
            john.id,
            "John's group"
        );

        await addTestUserToTestGroup(
            group.id,
            jane.id
        );

        const agent = supertest.agent(app);

        await agent
            .post("/auth/login")
            .type("form")
            .send({
                username: "john",
                password: "bla"
            })
            .expect(200);

        const response = await agent
            .type("form")
            .delete(`/groups/${group.id}/participants`)
            .send({
                userId: jane.id
            })
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("User removed from group successfully!");
        expect("participant" in response.body).toBe(true);
    });

    it("DELETE | Should fail removing a participant from a group due to user not being a group member.", async () => {
        const john = await createTestUser(
            "john",
            "john",
            "doe",
            "bla",
        );
        const jane = await createTestUser(
            "jane",
            "jane",
            "doe",
            "bla",
        );

        const group = await createTestGroup(john.id, "John's group");

        const agent = supertest.agent(app);

        await agent
            .type("form")
            .post("/auth/login")
            .send({
                username: "john",
                password: "bla"
            })
            .expect(200);

        const response = await agent
            .type("form")
            .delete(`/groups/${group.id}/participants`)
            .send({
                userId: jane.id
            })

        expect(response.body.success).toBe(false);
        expect("errors" in response.body).toBe(true);
        expect(response.body.errors.some((e: ValidationError) => e.msg === `The user with an id of: '${jane.id}' is not a participant of this group.`));
    });
});
