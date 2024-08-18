import { css } from "./utils/style";

document.adoptedStyleSheets.push(css`
	:root {
		font-family: system-ui;

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
`);

export const globalSheet = css`
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

		[role="textbox"] {
			all: unset;
			display: inline-block;
			padding: 0.8em;
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

		hr {
			all: unset;
			display: block;
			min-block-size: 0.01em;
			min-inline-size: 0.01em;
			border-radius: 0.005em;
			background-color: currentColor;
			opacity: 0.2;
			place-self: stretch;
		}

		[role="button"] {
			all: unset;
			display: inline-block;
			padding: 0.4em 1.2em;
			border-radius: var(--radius-full);
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
`;

document.adoptedStyleSheets.push(globalSheet);
