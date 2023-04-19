import { getTimeline } from "@/api/graph"
import { Timeline } from "@/libs/timeline"
import type { Address } from "@/utils/address"
import { $ } from "master-ts/library/$"
import { defineComponent } from "master-ts/library/component"
import type { SignalReadable } from "master-ts/library/signal/readable"
import { css, html } from "master-ts/library/template"

const UserPageComponent = defineComponent("x-user-page")
export function UserPage(userAddress: SignalReadable<Address>) {
	const component = new UserPageComponent()

	const timeline = $.derive(() => getTimeline({ author: userAddress.ref }))

	component.$html = html`
		<h1>User Page</h1>
		${Timeline(timeline)}
	`

	return component
}
UserPageComponent.$css = css`

`
