import prisma from "@/utils/db";
import { validTokens } from "@/utils/token";

export default async function handler(req, res) {
	if (req.method !== "GET") {
		return res.status(405).json({ error: "Method not allowed" });
	} else {
		let email = await validTokens(req, res);
		if (!email) {
			return res.status(401).json({ error: "Unauthorized" });
		}

		try {
			let templates = await prisma.Template.findMany({
				where: {
					user: {
						email: email,
					},
				},
				select: {
					id: true,
					title: true,
					code: true,
				},
			});
			return res.status(200).json({
				data: templates,
				message: "Templates retrieved successfully.",
			});
		} catch (error) {
			console.error("Error retrieving templates:", error);
			return res.status(500).json({ error: "Internal server error" });
		}
	}
}
