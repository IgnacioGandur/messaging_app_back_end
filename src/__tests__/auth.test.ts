import { describe, it, expect } from "vitest";
import supertest from "supertest";
import app from "../app.js";

describe("Auth Router", () => {
    it("POST | Should register a new user.", async () => {
        const response = await supertest(app)
            .post("/auth/register")
            .type("form")
            .send({
                username: "Ignacio",
                password: "random"
            })
            .expect(200)
            .expect("Content-Type", /json/);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("User registered successfully!");
        expect("user" in response.body).toBe(true);
    });
})
