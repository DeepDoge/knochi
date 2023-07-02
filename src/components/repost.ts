import { RepostSvg } from "@/assets/svgs/repost"
import { routeHash } from "@/router"
import type { Address } from "@/utils/address"
import type { PostId } from "@/utils/post-id"
import { $ } from "master-ts/library/$"
import { defineComponent } from "master-ts/library/component"
import type { SignalReadable } from "master-ts/library/signal"
import { css, html } from "master-ts/library/template"
import { PostFromIdUI } from "./post-from-id"

const RepostComponent = defineComponent("x-repost")
export function RepostUI(echo: SignalReadable<{ postId: PostId; authorAddress: Address }>) {
	const component = new RepostComponent()

	const postId = $.derive(() => echo.ref.postId)
	const authorAddress = $.derive(() => echo.ref.authorAddress)

	component.$html = html`
		<div class="author">
			${RepostSvg()} <span class="text"><a href=${() => routeHash({ path: authorAddress.ref })}>${authorAddress}</a> reposted</span>
		</div>
		${PostFromIdUI(postId)}
	`

	return component
}

RepostComponent.$css = css`
	:host {
		display: grid;
		gap: calc(var(--span) * 0.5);
	}

	.author {
		font-size: 1em;
		opacity: 0.8;
	}

	.author {
		display: grid;
		grid-template-columns: 1em auto;
		align-items: center;
		gap: calc(var(--span) * 0.5);
	}

	.text {
		font-size: 0.8em;
	}
`
