import { css, sheet } from "./utils/style";

document.adoptedStyleSheets.push(
	sheet(css`
		:root {
			font-family: monospace;
			font-size: 1.25em;
			color-scheme: dark light;

			--base: #000;
			--pop: #fff;
			accent-color: var(--pop);

			--success: #388e3c;
			--fail: #d32f2f;
		}

		@media (prefers-color-scheme: light) {
			:root {
				--base: #fff;
				--pop: #000;

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
			container-type: inline-size;
			background-color: var(--base);
			color: var(--pop);
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
		ul,
		ol {
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
			color: var(--pop);
			background-color: var(--base);
		}

		button {
			appearance: none;
			border: none;
			background: unset;
			font: inherit;
			color: inherit;
			cursor: pointer;
			padding: 0;
			margin: 0;
		}

		button:disabled {
			cursor: not-allowed;
			opacity: 0.5;
		}

		a {
			text-decoration: none;
		}

		:is(.button, button, a):focus-visible {
			outline: solid 0.2em currentColor;
			outline-offset: -0.25em;
		}

		[popover] {
			max-block-size: 100dvb;
		}

		[popover][anchor] {
			margin: 0;
			inset: 0;

			position-area: span-inline-start block-end;
			position-try:
				flip-inline,
				flip-block,
				flip-block flip-inline;

			inline-size: max-content;
			max-inline-size: 100dvi;
		}

		dialog::backdrop {
			background-color: color-mix(in srgb, var(--base), transparent 50%);
		}

		dialog {
			border-color: color-mix(in srgb, var(--base), var(--pop) 10%);
		}

		dialog {
			transition:
				display allow-discrete,
				overlay allow-discrete,
				scale ease-in-out,
				opacity ease-in-out;
			transition-duration: 0.15s;

			scale: 0.75;
			opacity: 0;
		}

		dialog[open] {
			transition:
				display allow-discrete,
				overlay allow-discrete,
				scale cubic-bezier(0.34, 1.2, 0.64, 1),
				opacity ease-in-out;
			transition-duration: 0.25s;

			scale: 1;
			opacity: 1;
		}

		@starting-style {
			dialog[open] {
				scale: 0;
				opacity: 0.75;
			}
		}

		dialog::backdrop {
			transition:
				display allow-discrete,
				overlay allow-discrete,
				opacity linear;
			transition-duration: inherit;

			opacity: 0;
		}

		dialog[open]::backdrop {
			opacity: 1;
		}

		@starting-style {
			dialog[open]::backdrop {
				opacity: 0;
			}
		}

		hr {
			border-color: color-mix(in srgb, currentColor, transparent 75%);
			margin-inline: 16%;
			margin-block: 0.5em;
		}

		.button {
			display: block flow;
			padding-block: 0.5em;
			padding-inline: 1em;
			background-color: color-mix(in srgb, var(--pop) 95%, var(--base));
			color: var(--base);
			text-align: center;
		}

		.input {
			border: 0;
			background-color: color-mix(in srgb, var(--pop) 10%, var(--base));
			color: var(--pop);
			padding-block: 0.5em;
			padding-inline: 0.5em;
		}

		.input:focus-visible {
			outline: solid 0.2em currentColor;
		}

		.visually-hidden {
			position: absolute;
			scale: 0;
		}
	`),
);
