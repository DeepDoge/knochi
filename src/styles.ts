import { css, sheet } from "purify-js"

document.adoptedStyleSheets.push(
	sheet(css`
		:root {
			font-family: system-ui;
			font-size: clamp(0.85rem, max(2dvw, 1.5dvh), 1rem);

			--back: var(--dark);
			--front: var(--light);
			color-scheme: dark;

			color: var(--front);
			background-color: var(--back);
		}

		:root {
			--light: hsl(0, 0%, 100%);
			--dark: hsl(0, 0%, 0%);

			--primary: hsl(0, 0%, 100%);
		}

		:root {
			--radius: 0.75em;
			--radius-full: 100000vmax;
		}

		body {
			min-height: 100svh;
		}
	`),
)

export const globalSheet = sheet(css`
	@layer global;

	@layer global {
		*,
		*::before,
		*::after {
			box-sizing: border-box;
		}

		* {
			color: var(--front);
			background-color: var(--back);
		}

		* {
			margin: 0;
			padding: 0;
		}

		.input {
			all: unset;
			display: inline-block;
			padding: 0.75em;
			border-radius: var(--radius);
			border: none;
			background-color: hsl(
				from var(--back) h s calc(calc(1 - l) * 0.5) / 0.1
			);
			font: inherit;

			&:focus-visible {
				outline: solid 1px var(--primary);
			}

			textarea& {
				resize: vertical;
				min-height: 4.5em;
			}
		}

		.button {
			all: unset;
			display: inline-block;
			padding: 0.5em 1em;
			border-radius: var(--radius);
			border: solid 1px var(--primary);
			background-color: var(--primary);
			color: var(--back);
			font: inherit;
			cursor: pointer;
		}
	}
`)
