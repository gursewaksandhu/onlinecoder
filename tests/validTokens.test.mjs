// tests/validTokens.test.js
// In order to run test, you must add "type": "module" to package.json
// Make sure to remove it from package.json when done otherwise you will get an error when doing npm run dev

import { test, describe } from "node:test";
import assert from "assert";
import jwt from "jsonwebtoken";
import { validTokens } from "../utils/token.js";
import { serialize } from "cookie";

const SECRET_KEY = "test-secret";
const REFRESH_SECRET_KEY = "test-refresh-secret";
process.env.SECRET_KEY = SECRET_KEY;
process.env.REFRESH_SECRET_KEY = REFRESH_SECRET_KEY;

// Simple manual mock instead of jest.fn()
function createMockReqRes({ accessToken, refreshToken }) {
	const cookies = [];
	if (accessToken) cookies.push(`accessToken=${accessToken}`);
	if (refreshToken) cookies.push(`refreshToken=${refreshToken}`);

	const req = {
		headers: {
			cookie: cookies.join("; "),
		},
	};

	let headers = {};
	const res = {
		setHeader: (key, value) => {
			headers[key] = value;
		},
		_getHeaders: () => headers,
	};

	return { req, res };
}

describe("validTokens()", () => {
	test("returns email when access token is valid", async () => {
		const email = "user@example.com";
		const token = jwt.sign({ data: { user: email } }, SECRET_KEY, {
			expiresIn: "10m",
		});

		const { req, res } = createMockReqRes({
			accessToken: token,
			refreshToken: "unused",
		});

		const result = await validTokens(req, res);
		assert.equal(result, email);
		assert.equal(Object.keys(res._getHeaders()).length, 0); // No new token
	});

	test("refreshes token if access is expired and refresh is valid", async () => {
		const email = "user@example.com";

		const expiredAccessToken = jwt.sign({ data: { user: email } }, SECRET_KEY, {
			expiresIn: "-1s",
		});
		const validRefreshToken = jwt.sign(
			{ data: { user: email } },
			REFRESH_SECRET_KEY,
			{ expiresIn: "10m" }
		);

		const { req, res } = createMockReqRes({
			accessToken: expiredAccessToken,
			refreshToken: validRefreshToken,
		});

		const result = await validTokens(req, res);
		assert.equal(result, email);
		assert.ok(res._getHeaders()["Set-Cookie"]); // Token refreshed
	});

	test("returns empty string when both tokens are missing", async () => {
		const { req, res } = createMockReqRes({});

		const result = await validTokens(req, res);
		assert.equal(result, "");
	});

	test("returns empty string when refresh token is expired", async () => {
		const email = "user@example.com";

		const expiredAccessToken = jwt.sign({ data: { user: email } }, SECRET_KEY, {
			expiresIn: "-1s",
		});
		const expiredRefreshToken = jwt.sign(
			{ data: { user: email } },
			REFRESH_SECRET_KEY,
			{ expiresIn: "-1s" }
		);

		const { req, res } = createMockReqRes({
			accessToken: expiredAccessToken,
			refreshToken: expiredRefreshToken,
		});

		const result = await validTokens(req, res);
		assert.equal(result, "");
	});
});
