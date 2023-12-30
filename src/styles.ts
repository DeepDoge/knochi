import { css, sheet } from "master-ts"

document.adoptedStyleSheets.push(
	sheet(css`
		:root {
			font-family: system-ui;
			font-size: clamp(0.85rem, max(2dvw, 1.5dvh), 1rem);

			color-scheme: dark;
			color: hsl(var(--light));
			background-color: hsl(var(--dark));
		}

		:root {
			--light: hsv(0, 0%, 100%);
			--dark: hsv(0, 0%, 0%);

			--primary: hsv(0, 0%, 100%);
		}

		body {
			min-height: 100svh;
		}
	`),
)

export const globalSheet = sheet(css`
	*,
	*::before,
	*::after {
		box-sizing: border-box;
	}

	* {
		margin: 0;
		padding: 0;
	}
`)
