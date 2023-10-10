import { commonStyle } from "@/import-styles"
import { fragment, onConnected$, type TagsNS } from "master-ts/core"
import { css } from "master-ts/extra/css"
import { defineCustomTag } from "master-ts/extra/custom-tags"
import { html } from "master-ts/extra/html"

const floatingBoxTag = defineCustomTag("x-floating-box")
export function spawnFloatingBox(mouseEvent: MouseEvent, ...boxChildren: TagsNS.AcceptedChild[]) {
	const root = floatingBoxTag()
	const dom = root.attachShadow({ mode: "open" })
	dom.adoptedStyleSheets.push(commonStyle, style)

	dom.append(
		fragment(html`
			<div class="backdrop" on:click=${close}></div>
			<div class="box">${boxChildren}</div>
		`)
	)
	document.body.appendChild(dom)

	const box = dom.querySelector(".box") as HTMLDivElement

	onConnected$(root, () => {
		const rect = box.getBoundingClientRect()
		box.style.transform =
			`translate(calc(${mouseEvent.x - rect.width * 0.5}px + var(--offset-x, 0px)),` +
			`calc(${mouseEvent.y + scrollY - rect.height}px + var(--offset-y, 0px)))`
		updateOffsets()

		window.addEventListener("resize", close, { once: true })
		return () => window.removeEventListener("resize", close)
	})

	function close() {
		root.remove()
	}

	function updateOffsets() {
		const boxRect = box.getBoundingClientRect()

		if (boxRect.top < 0) box.style.setProperty("--offset-y", `${-boxRect.top}px`)
		if (mouseEvent.target instanceof HTMLElement) {
			const targetRect = mouseEvent.target.getBoundingClientRect()
			if (boxRect.bottom > targetRect.top) {
				box.style.setProperty("--offset-y", `${-(boxRect.bottom - targetRect.top)}px`)
			}
		}

		if (boxRect.left < 0) box.style.setProperty("--offset-x", `${-boxRect.left}px`)
		const right = innerWidth - boxRect.right
		if (right < 0) box.style.setProperty("--offset-x", `${right - 16}px`)
	}

	return root
}

const style = css`
	:host {
		display: contents;
	}

	.box {
		position: absolute;
		top: 0;
		left: 0;
		max-width: 100vw;
		z-index: 101;
	}

	.backdrop {
		position: fixed;
		inset: 0;
		z-index: 100;
	}
`
