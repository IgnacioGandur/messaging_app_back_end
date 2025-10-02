import { describe, it, expect } from "vitest";

function sum(a: number, b: number): number {
    return a + b;
}

describe("Sum function", () => {
    it("Should sum two numbers.", () => {
        expect(sum(5, 5)).toBe(10);
    })
})

