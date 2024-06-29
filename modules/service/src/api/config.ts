import { Config } from "@/config";

export async function GET() {
	return new Response(JSON.stringify(await Config.get()), {
		headers: {
			"Content-Type": "application/json",
		},
	});
}
