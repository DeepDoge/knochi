export function POST(request: Request) {
	return new Response("Hello, World!", {
		headers: { "Content-Type": "text/plain" },
	});
}
