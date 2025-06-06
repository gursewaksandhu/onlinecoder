import prisma from "@/utils/db";
import { comparePassword } from "@/utils/auth";

export default async function handler(req, res) {
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(400).json({ error: "Email and password required" });
	}

	//Check if email exists as a user
	// Retrieve hashed password
	const hash = prisma.user.findUnique({
		where: {
			email: email,
		},
		select: {
			password: true,
		},
	});

	if (hash) {
		if (await comparePassword(password, hash)) {
			// calls function to make and store the token
		} else {
			return res.status(400).json("Incorrect Password");
		}
	} else {
		return res.status(400).json("User not found");
	}

	//Create Tokens if valid login
}
