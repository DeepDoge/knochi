import { css, sheet } from "./utils/style";

document.adoptedStyleSheets.push(
	sheet(css`
		:root {
			font-family: monospace;
			font-size: 1.25em;
			color-scheme: dark light;

			--base: #000;
			--accent: #fff;
			accent-color: var(--accent);

			--success: #388e3c;
			--fail: #d32f2f;
		}

		@media (prefers-color-scheme: light) {
			:root {
				--base: #fff;
				--accent: #000;

				--success: #4caf50;
				--fail: #f44336;
			}
		}

		*,
		*::before,
		*::after {
			box-sizing: border-box;
		}

		* {
			font: inherit;
		}

		body {
			min-block-size: 100lvh;
			background-color: var(--base);
			color: var(--accent);
			margin: 0;
		}

		h1,
		h2,
		h3,
		h4,
		h5,
		h6,
		input,
		select,
		textarea,
		hr {
			margin: 0;
			padding: 0;
		}

		img,
		picture,
		svg,
		video {
			display: block flow;
			max-inline-size: 100%;
		}

		strong {
			font-weight: bold;
		}

		small {
			font-size: smaller;
		}

		input,
		select,
		textarea {
			min-inline-size: 0;
			background-color: transparent;
			border: 0;
			outline: 0;
		}

		select option {
			color: var(--accent);
			background-color: var(--base);
		}

		button {
			all: unset;
			font: inherit;
			color: inherit;
			cursor: pointer;
		}

		a {
			text-decoration: none;
		}

		.button {
			padding-block: 0.5em;
			padding-inline: 1em;
			background-color: color-mix(in srgb, var(--accent) 95%, var(--base));
			color: var(--base);
			text-align: center;
		}

		.button:focus-visible {
			outline: solid 0.2em currentColor;
			outline-offset: -0.25em;
		}

		.input {
			border: 0;
			background-color: color-mix(in srgb, var(--accent) 10%, var(--base));
			color: var(--accent);
			padding-block: 0.5em;
			padding-inline: 0.5em;
		}

		.input:focus-visible {
			outline: solid 0.2em currentColor;
		}

		[role="group"] {
			display: block grid;
			grid-template-columns: auto 1fr;
			gap: 0.5em;

			&.input :focus {
				outline: none;
			}

			&.input:has(:focus-visible) {
				outline: solid 0.2em currentColor;
			}
		}
	`),
);
