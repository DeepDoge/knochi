import "./styles";

import { tags } from "purify-js";
import { Header } from "./features/header/Header";
import { css, scopeCss } from "./utils/style";

const { div, main } = tags;

function App() {
	return div().id("app").use(scopeCss(AppCss)).children(Header(), main().children("Content Here"));
}

const AppCss = css`
	:scope {
		container-name: app;
		container-type: inline-size;

		display: block grid;
		gap: 1em;
		grid-template-areas:
			"main"
			"header";
	}

	header {
		grid-area: header;

		position: sticky;
		inset-inline: 0;
		inset-block-end: 0;
	}

	main {
		grid-area: main;
		min-block-size: 100svh;
	}
`;

document.body.append(App().element);
