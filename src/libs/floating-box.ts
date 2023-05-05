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

	const rect = box.getBoundingClientRect()
	box.style.setProperty("--default-top", `${mouseEvent.y - rect.height}px`)
	box.style.setProperty("--default-left", `${mouseEvent.x - rect.width * 0.5}px`)

	component.$interval(() => {
		box.style.top = `var(--default-top)`
		box.style.left = `var(--default-left)`
		const rect = box.getBoundingClientRect()
		if (rect.top < 0) box.style.top = `calc(var(--default-top) - ${rect.top}px)`

		if (rect.left < 0) box.style.left = `calc(var(--default-left) - ${rect.left}px)`
		else if (rect.right < 0) box.style.left = `calc(var(--default-left) + ${rect.right}px)`
	}, 100)

	return component
}

FloatingBoxComponent.$css = css`
	:host {
		display: contents;
	}

	.box {
		position: absolute;
		max-width: 100vw;
		z-index: 101;
	}

	.backdrop {
		position: fixed;
		inset: 0;
		z-index: 100;
	}
`
