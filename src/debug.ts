import { $ } from "master-ts/library/$"
import type { SignalReadable } from "master-ts/library/signal"
import { css } from "master-ts/library/template/tags/css"
import { html } from "master-ts/library/template/tags/html"

const Component = $.component()
function AppComponent() {
	const component = new Component()

	function randomHsl() {
		return `hsl(${Math.random() * 360 + Math.random()}, 75%, 75%)`
	}

	const colors = $.writable(new Array(30).fill("").map(() => randomHsl()))

	function add() {
		const index = Math.floor(Math.random() * colors.ref.length)
		colors.ref.splice(index, 0, randomHsl())
		colors.signal()
	}

	function remove() {
		const index = Math.floor(Math.random() * colors.ref.length)
		colors.ref.splice(index, 1)
		colors.signal()
	}

	function Item(color: string | SignalReadable<string>) {
		return html` <div class="item" style:background-color=${color}>${color}</div> `
	}

	component.$html = html`
		<div class="actions">
			<button on:click=${add}>Add</button>
			<button on:click=${remove}>Remove</button>
		</div>
		<div class="content">
			<div class="map">${() => colors.ref.map((color) => Item(color))}</div>
			<div class="each">${$.each(colors).as((color) => Item(color))}</div>
		</div>
	`
	return component
}
Component.$css = css`
	:host {
		display: grid;
		align-content: start;
		gap: 1rem;
	}

	.actions {
		display: grid;
		grid-auto-flow: column;
		gap: 1rem;
	}

	.content {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		align-items: start;
	}

	.content > * {
		display: grid;
		align-content: start;
	}

	.item {
		display: grid;
		place-items: center;
	}
`

document.querySelector("#app")!.replaceWith(AppComponent())
