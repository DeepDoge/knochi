import { defineComponent } from "master-ts/library/component"
import { css, html, TemplateValue } from "master-ts/library/template"

const FloatingBoxComponent = defineComponent("x-floating-box")
export function spawnFloatingBox(mouseEvent: MouseEvent, ...boxChildren: TemplateValue[]) {
	const component = new FloatingBoxComponent()

	component.$html = html`
		<div class="backdrop" on:click=${() => component.remove()}></div>
		<div class="box">${boxChildren}</div>
	`
	document.body.appendChild(component)

	const box = component.$root.querySelector(".box") as HTMLDivElement

	function update() {
		const rect = box.getBoundingClientRect()
		if (rect.top < 0) box.style.setProperty("--offset-y", `${-rect.top}px`)

		if (rect.left < 0) box.style.setProperty("--offset-x", `${-rect.left}px`)
		const right = innerWidth - rect.right
		if (right < 0) box.style.setProperty("--offset-x", `${right}px`)
	}
	component.$interval(update, 100)
	component.$onMount(() => {
		const rect = box.getBoundingClientRect()
		box.style.transform = `translate(calc(${mouseEvent.x - rect.width * 0.5}px + var(--offset-x, 0px)),calc(${
			mouseEvent.y - rect.height
		}px + var(--offset-y, 0px)))`

		update()
	})

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
