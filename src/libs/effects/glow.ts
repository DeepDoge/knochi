import { defineComponent } from "master-ts/library/component"
import { css } from "master-ts/library/template"

const GlowEffectComponent = defineComponent("x-glow-effect")
export function GlowEffect() {
	const component = new GlowEffectComponent()
	component.$html = [document.createComment("")]
	return component
}

GlowEffectComponent.$css = css`
	:host {
		position: absolute;
		inset: 0;
		z-index: -1;

		border-radius: inherit;
		background-color: hsl(var(--master-hsl), 50%);
		filter: blur(1rem);
	}
`
