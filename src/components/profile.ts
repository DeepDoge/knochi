import { ProfileAddressUI } from "@/components/profile-address"
import { ProfileAvatarUI } from "@/components/profile-avatar"
import { ProfileNameUI } from "@/components/profile-name"
import { commonStyle } from "@/import-styles"
import type { Address } from "@/utils/address"
import { SignalOrFn, css, customTag, fragment, sheet } from "master-ts"

const profileTag = customTag("x-profile")
export function ProfileUI(address: SignalOrFn<Address>) {
	const root = profileTag()
	const dom = root.attachShadow({ mode: "open" })
	dom.adoptedStyleSheets.push(commonStyle, style)

	dom.append(fragment(ProfileAvatarUI(address), ProfileNameUI(address), ProfileAddressUI(address)))

	return root
}

const style = sheet(css`
	:host {
		display: grid;
		grid-template-areas:
			"avatar . name"
			"avatar . address"
			"avatar . . ";
		grid-template-columns: 2.3em calc(var(--span) * 0.5) auto;
		place-content: start;
	}

	.avatar {
		grid-area: avatar;
	}
	.name {
		grid-area: name;
		font-weight: bold;
	}
	.address {
		grid-area: address;
		color: hsl(var(--base-text--hsl), 0.65);
		font-size: 0.9em;
	}
`)
