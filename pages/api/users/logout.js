import { expireTokens } from "@/utils/token";

export default async function handler(req, res) {
	if (req.method != "POST") {
		return res.status(405).json({ error: "Method not allowed." });
	}
	expireTokens(res);
	return res
		.status(200)
		.json({ data: {}, message: "Successfully Logged Out." });
}
