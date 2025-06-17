// Used for storing token task
// - creating and storing Tokens
// - verifying Tokens
// - creating refresh Tokens

import jwt from "jsonwebtoken";

import { serialize, parse } from "cookie";

export async function createToken(email, res) {
	let accessToken = jwt.sign(
		{
			data: { user: email },
		},
		process.env.SECRET_KEY,
		{ expiresIn: "10m" }
	);

	// Need to create Refresh Token
	let refreshToken = jwt.sign(
		{
			data: { user: email },
		},
		process.env.REFRESH_SECRET_KEY,
		{ expiresIn: "24h" }
	);
	//Store in cookies

	res.setHeader("Set-Cookie", [
		serialize("accessToken", accessToken, {
			httpOnly: true,
			path: "/", // Allows me to access from anywhere, no longer specific to an endpoint
			maxAge: 60 * 10,
		}),
		serialize("refreshToken", refreshToken, {
			httpOnly: true,
			path: "/",
			maxAge: 60 * 60 * 24,
		}),
	]);
	// TODO: remove this return after project is finished, this is just for testing right now.
	return { accessToken, refreshToken };
}

// This function is also responsible for refreshing the token.
// If no token existss then return empty string
// if tokens exist:
// if access token valid return token_string
// else: check if refresh token valid.
// if still valid give a new access token (leave refresh as is). return token_string
// if expired: return empty string
export async function validToken(token) {
	let cookies = parse(req.headers.cookie || "");
}

//Overwrite the existing tokens with one that expires in 0
export async function expireTokens(res) {
	let expiredAccessToken = jwt.sign(
		{
			data: { user: "" },
		},
		process.env.SECRET_KEY,
		{ expiresIn: 0 }
	);
	let expiredRefreshToken = jwt.sign(
		{
			data: { user: "" },
		},
		process.env.REFRESH_SECRET_KEY,
		{ expiresIn: 0 }
	);
	res.setHeader("Set-Cookie", [
		serialize("accessToken", expiredAccessToken, {
			httpOnly: true,
			path: "/", // Allows me to access from anywhere, no longer specific to an endpoint
			maxAge: 0,
		}),
		serialize("refreshToken", expiredRefreshToken, {
			httpOnly: true,
			path: "/",
			maxAge: 0,
		}),
	]);
}
