import { PostId } from "@/utils/post-id"
import { $ } from "master-ts/library/$"
import type { SignalReadable, SignalWritable } from "master-ts/library/signal"

const routePath = $.writable("")
const routePathArr = $.derive(() => routePath.ref.split("/"))
const routePostId = $.writable<PostId | null>(null)
const route = {
	path: routePath,
	pathArr: routePathArr,
	postId: routePostId,
}
const routeReadable = route as {
	[K in keyof typeof route]: (typeof route)[K] extends SignalWritable<infer U> ? SignalReadable<U> : (typeof route)[K]
}
export { routeReadable as route }
function updateRoute() {
	const [path, postId] = location.hash.substring(1).split("@")

	routePath.ref = path ?? ""
	routePostId.ref = postId ? PostId(postId) : null
}
updateRoute()
window.addEventListener("hashchange", updateRoute)
setInterval(updateRoute, 100)

export function routeHref({ path, postId }: { path?: string; postId?: PostId | null }): string {
	if (path === undefined) path = routePath.ref
	if (postId === undefined) postId = routePostId.ref

	return `#${path}${postId ? `@${postId}` : ""}`
}
