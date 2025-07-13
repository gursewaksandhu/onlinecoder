import prisma from "@/utils/db";
import { validTokens } from "@/utils/token";

export default async function handler(req, res) {
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	} else {
		let email = await validTokens(req, res);
		if (!email) {
			return res.status(401).json({ error: "Unauthorized" });
		}

		let { title, code } = req.body;

		if (!title || !code) {
			return res
				.status(400)
				.json({ error: "Title, explanation, and code are required." });
		}

		try {
			let template = await prisma.Template.create({
				data: {
					title,
					code,
					user: {
						connect: { email },
					},
				},
				select: {
					id: true,
					title: true,
					code: true,
				},
			});
			return res
				.status(200)
				.json({ data: template, message: "Template created successfully." });
		} catch (error) {
			console.error("Error creating template:", error);
			return res.status(500).json({ error: "Internal server error" });
		}
	}
}
