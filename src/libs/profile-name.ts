import { routeHref } from "@/router"
import type { Address } from "@/utils/address"
import { defineComponent } from "master-ts/library/component"
import type { SignalReadable } from "master-ts/library/signal"
import { css, html } from "master-ts/library/template"

const ProfileNameComponent = defineComponent("x-profile-name")
export function ProfileName(address: SignalReadable<Address>) {
	const component = new ProfileNameComponent()

	component.$html = html` <a class="name" href=${() => routeHref({ path: address.ref, postId: null })}>Nameless</a> `

	return component
}

ProfileNameComponent.$css = css`
	:host {
		display: grid;
	}
`
