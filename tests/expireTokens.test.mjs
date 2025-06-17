// tests/expireTokens.test.mjs
import test from "node:test";
import assert from "node:assert";
import { expireTokens } from "../utils/token.js"; // adjust path if needed

test("expireTokens sets expired cookies", async () => {
	const fakeRes = {
		headers: {},
		setHeader(key, value) {
			this.headers[key] = value;
		},
	};

	// Set environment variables for JWT signing
	process.env.SECRET_KEY = "test-access-secret";
	process.env.REFRESH_SECRET_KEY = "test-refresh-secret";

	await expireTokens(fakeRes);

	const cookies = fakeRes.headers["Set-Cookie"];

	// Should be an array of two cookies
	assert.ok(Array.isArray(cookies), "Set-Cookie header should be an array");
	assert.strictEqual(cookies.length, 2, "Should have 2 cookies set");

	// Check each cookie string contains the right name and maxAge=0
	assert.ok(
		cookies.some(
			(c) => c.startsWith("accessToken=") && c.includes("Max-Age=0")
		),
		"accessToken cookie should be expired"
	);
	assert.ok(
		cookies.some(
			(c) => c.startsWith("refreshToken=") && c.includes("Max-Age=0")
		),
		"refreshToken cookie should be expired"
	);

	// Check path is set to '/'
	assert.ok(
		cookies.every((c) => c.includes("Path=/")),
		"All cookies should have Path=/"
	);
});
