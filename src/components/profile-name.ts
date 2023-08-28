import { routeHash } from "@/router"
import type { Address } from "@/utils/address"
import { defineComponent } from "master-ts/library/component"
import type { SignalReadable } from "master-ts/library/signal"
import { css } from "master-ts/library/template/tags/css"
import { html } from "master-ts/library/template/tags/html"

const ProfileNameComponent = defineComponent("x-profile-name")
export function ProfileNameUI(address: SignalReadable<Address>) {
	const component = new ProfileNameComponent()

	component.$html = html` <a class="name" href=${() => routeHash({ path: address.ref, postId: null })}>Nameless</a> `

	return component
}

ProfileNameComponent.$css = css`
	:host {
		display: grid;
	}

	.name {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
`
