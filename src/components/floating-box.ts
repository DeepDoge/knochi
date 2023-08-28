import { $ } from "master-ts/library/$"
import { defineComponent } from "master-ts/library/component"
import type { Template } from "master-ts/library/template/node"
import { css } from "master-ts/library/template/tags/css"
import { html } from "master-ts/library/template/tags/html"

const FloatingBoxComponent = defineComponent("x-floating-box")
export function spawnFloatingBox(mouseEvent: MouseEvent, ...boxChildren: Template.Value[]) {
	const component = new FloatingBoxComponent()

	component.$html = html`
		<div class="backdrop" on:click=${close}></div>
		<div class="box">${boxChildren}</div>
	`
	document.body.appendChild(component)

	const box = component.$shadowRoot.querySelector(".box") as HTMLDivElement

	$.onMount$(component, () => {
		const rect = box.getBoundingClientRect()
		box.style.transform =
			`translate(calc(${mouseEvent.x - rect.width * 0.5}px + var(--offset-x, 0px)),` +
			`calc(${mouseEvent.y + scrollY - rect.height}px + var(--offset-y, 0px)))`
		updateOffsets()

		window.addEventListener("resize", close, { once: true })
		return () => window.removeEventListener("resize", close)
	})

	function close() {
		component.remove()
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

	return component
}

FloatingBoxComponent.$css = css`
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
