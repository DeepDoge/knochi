import { css, sheet } from "purified-js";

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
);

export const globalSheet = sheet(css`
	@layer global;

	@layer global {
		*,
		*::before,
		*::after {
			box-sizing: border-box;
		}

		* {
			margin: 0;
			padding: 0;
		}

		body {
			color: var(--front);
			background-color: var(--back);
		}

		/* [aria-busy="true"] {
			cursor: wait;

			&:empty {
				text-align: center;
			}

			&::before {
				content: "";
				display: inline-block;
				inline-size: 1em;
				aspect-ratio: 1;
				vertical-align: -0.1em;
				margin-right: 0.5em;
				background-image: url("data:image/svg+xml,%3Csvg fill='none' height='24' width='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg' %3E%3Cstyle%3E g %7B animation: rotate 2s linear infinite; transform-origin: center center; %7D circle %7B stroke-dasharray: 75,100; stroke-dashoffset: -5; animation: dash 1.5s ease-in-out infinite; stroke-linecap: round; %7D @keyframes rotate %7B 0%25 %7B transform: rotate(0deg); %7D 100%25 %7B transform: rotate(360deg); %7D %7D @keyframes dash %7B 0%25 %7B stroke-dasharray: 1,100; stroke-dashoffset: 0; %7D 50%25 %7B stroke-dasharray: 44.5,100; stroke-dashoffset: -17.5; %7D 100%25 %7B stroke-dasharray: 44.5,100; stroke-dashoffset: -62; %7D %7D %3C/style%3E%3Cg%3E%3Ccircle cx='12' cy='12' r='10' fill='none' stroke='rgb(136, 145, 164)' stroke-width='4' /%3E%3C/g%3E%3C/svg%3E");
				background-size: contain;
				background-repeat: no-repeat;
			}
		} */

		[role="textbox"] {
			all: unset;
			display: inline-block;
			padding: 0.75em;
			border-radius: var(--radius);
			border: none;
			background-color: color-mix(in srgb, var(--back) 95%, currentColor);
			font: inherit;

			&:focus-visible {
				outline: solid 1px var(--primary);
			}

			textarea& {
				resize: vertical;
				min-height: 4.5em;
			}

			&:disabled {
				cursor: not-allowed;
				opacity: 0.5;
			}
		}

		[role="button"] {
			all: unset;
			display: inline-block;
			padding: 0.5em 1em;
			border-radius: var(--radius);
			border: solid 1px var(--primary);
			background-color: var(--primary);
			color: var(--back);
			font: inherit;
			cursor: pointer;

			&:disabled {
				cursor: not-allowed;
				opacity: 0.5;
			}
		}

		[role="group"] {
			display: inline-flex;
			gap: 1px;

			& > *:not(:first-child) {
				border-start-start-radius: 0;
				border-end-start-radius: 0;
			}

			& > *:not(:last-child) {
				border-start-end-radius: 0;
				border-end-end-radius: 0;
			}
		}

		label:has(> input:is([type="checkbox"], [type="radio"])) {
			display: inline-flex;
			inline-size: fit-content;
			gap: 0.5ch;
			align-items: center;

			& > input {
				position: absolute;
				pointer-events: none;
				scale: 0;
			}

			&::before {
				content: "";
				display: block;
				inline-size: 1.25em;
				aspect-ratio: 1;
				border: solid 0.15em currentColor;
				padding: 0.1em;
			}

			&:has(> input[type="checkbox"])::before {
				border-radius: var(--radius);
			}

			&:has(> input[type="radio"])::before {
				border-radius: var(--radius-full);
			}

			&:has(> input:checked)::before {
				background-color: currentColor;
				background-clip: content-box;
			}
		}
	}
`);

document.adoptedStyleSheets.push(globalSheet);
