import { $ } from "master-ts/library/$"
import type { SignalReadable } from "master-ts/library/signal/readable"

const route = {
	page: $.writable(""),
	modal: $.writable("")
}
const routeReadable = route as { [K in keyof typeof route]: SignalReadable<string> }
export { routeReadable as route }
function updateRoute() {
	const [page, modal] = location.hash.substring(1).split("@")

	route.page.ref = page ?? ""
	route.modal.ref = modal ?? ""
}
updateRoute()
window.addEventListener("hashchange", updateRoute)
setInterval(updateRoute, 100)
