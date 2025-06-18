import { hashPassword } from "/utils/auth";
import prisma from "/utils/db";
import { createToken } from "/utils/token";
export default async function handler(req, res) {
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(400).json({ error: "Email and password are required." });
	}

	// Check if the user already exists
	const existingUser = await prisma.User.findUnique({
		where: { email },
	});
	if (existingUser) {
		return res.status(409).json({ error: "User already exists." });
	}

	// Create a new user
	const user = await prisma.User.create({
		data: {
			email,
			password: await hashPassword(password), // In a real application, ensure to hash the password before storing it
		},
		select: {
			email: true,
		},
	});

	let token = await createToken(email, res);

	return res
		.status(200)
		.json({ data: user, message: "Successfully Signed Up." });
}
