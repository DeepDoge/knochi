import { $ } from "master-ts/library/$"
import type { SignalReadable } from "master-ts/library/signal/readable"
import type { SignalWritable } from "master-ts/library/signal/writable"
import { PostId } from "./api/graph"

const route = {
	path: $.writable(""),
	postId: $.writable<PostId | null>(null),
}
const routeReadable = route as { [K in keyof typeof route]: (typeof route)[K] extends SignalWritable<infer U> ? SignalReadable<U> : never }
export { routeReadable as route }
function updateRoute() {
	const [page, modal] = location.hash.substring(1).split("@")

	route.path.ref = page ?? ""
	route.postId.ref = modal ? PostId(modal) : null
}
updateRoute()
window.addEventListener("hashchange", updateRoute)
setInterval(updateRoute, 100)

export function routeHref({ path, postId }: { path?: string; postId?: PostId | null }): string {
	if (path === undefined) path = route.path.ref
	if (postId === undefined) postId = route.postId.ref

	return `#${path}${postId ? `@${postId}` : ""}`
}
