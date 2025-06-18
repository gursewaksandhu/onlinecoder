// Used for storing token task
// - creating and storing Tokens
// - verifying Tokens
// - creating refresh Tokens

import jwt from "jsonwebtoken";

import { serialize, parse } from "cookie";

/** Used to create and store tokens given an login email
 *
 * @param {*} email
 * @param {*} res
 * @returns {string, string} accessToken and refreshToken
 */
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
// if access token valid return email
// else: check if refresh token valid.
// if still valid give a new access token (leave refresh as is). return email
// if expired: return empty string

/** This function is used ot validate whether the user is logged in
 *
 * @param {*} req
 * @param {*} res
 * @returns email, of the logged in user.
 */
export async function validTokens(req, res) {
	try {
		let { accessToken, refreshToken } = retrieveCookies(req); // Can throw error. This is intended.
		// Check if access token is valid
		let email = checkAccessToken(accessToken);
		if (!email) {
			// Check Refresh Token
			email = checkRefreshToken(refreshToken); // This will throw error if refresh token is expired.
			// issue new access token
			let newAccessToken = issueNewAccessToken(email);
			// Place new token in cookies
			setUpdatedAccessToken(newAccessToken, res);
		}
		return email; // as long as the refresh token is active this line will be reached and the user will be authenticated.
	} catch (err) {
		console.error("Token Validation Error", err);
		return "";
	}
}

// HELPER FUNCTIONS FOR validTokens function

/**
 * Retrieves Tokens from cookies
 * @param {*} req
 * @param {*} res
 * @returns {string, string} returns accessToken and refreshToken
 * @throws {Error} if Tokens are missing from cookies.
 */
function retrieveCookies(req) {
	let cookies = parse(req.headers.cookie || "");
	if (cookies) {
		let accessToken = cookies.accessToken;
		let refreshToken = cookies.refreshToken;
		if (!accessToken || !refreshToken) {
			throw new Error("Missing Tokens");
		}
		return { accessToken, refreshToken };
	}
	console.error("No tokens found. Please login.");
	throw new Error("No tokens found. Please login.");
}

/**
 * Creates a token with the given email
 * @param {string} email
 * @returns {string} token string
 */
function issueNewAccessToken(email) {
	let token = jwt.sign(
		{
			data: { user: email },
		},
		process.env.SECRET_KEY,
		{ expiresIn: "10m" }
	);
	return token;
}

/**
 * Replaces previous accessToken with updated token
 * @param {*} token
 * @param {*} res
 */
function setUpdatedAccessToken(token, res) {
	res.setHeader(
		"Set-Cookie",
		serialize("accessToken", token, {
			httpOnly: true,
			path: "/",
			maxAge: 60 * 10,
		})
	);
}

/**
 * Checks if the refresh token is still valid
 * @param {*} token
 * @returns email
 * @throws {Error} if the the token has expired
 */
function checkRefreshToken(token) {
	try {
		let decoded = jwt.verify(token, process.env.REFRESH_SECRET_KEY);
		return decoded.data.user;
	} catch (err) {
		console.error("Refresh Token Expired: ${err.message}");
		throw new Error("Refresh Token Expired: ${err.message}");
	}
}
/**
 * Checks if the access token is still valid
 * @param {*} token
 * @returns email || ""
 */
function checkAccessToken(token) {
	try {
		let decoded = jwt.verify(token, process.env.SECRET_KEY);
		return decoded.data.user;
	} catch (err) {
		console.error("Access Token Expired: ${err.message}");
		return "";
	}
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
