import test from "node:test";
import assert from "node:assert";
import { createToken } from "../utils/token.js";

const fakeRes = {
	headers: {},
	setHeader(key, value) {
		this.headers[key] = value;
	},
};

test("createToken creates tokens and sets cookies", async (t) => {
	process.env.SECRET_KEY = "test-access-secret";
	process.env.REFRESH_SECRET_KEY = "test-refresh-secret";

	const { accessToken, refreshToken } = await createToken(
		"test@example.com",
		fakeRes
	);

	assert.strictEqual(typeof accessToken, "string");
	assert.strictEqual(typeof refreshToken, "string");

	const cookies = fakeRes.headers["Set-Cookie"];
	assert.ok(Array.isArray(cookies), "Cookies should be an array");
	assert.ok(
		cookies.some((c) => c.includes("accessToken")),
		"Has accessToken cookie"
	);
	assert.ok(
		cookies.some((c) => c.includes("refreshToken")),
		"Has refreshToken cookie"
	);
});
