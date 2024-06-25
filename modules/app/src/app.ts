import { css, fragment, sheet, tags } from "purify-js";

import { PostForm } from "./libs/PostForm";
import { globalSheet } from "./styles";

await navigator.serviceWorker.getRegistrations().then((registrations) => {
	for (let registration of registrations) {
		registration.unregister();
	}
});

await navigator.serviceWorker.register("/sw.js").then(
	(registration) => console.log("ServiceWorker registration successful"),
	(err) => console.log("ServiceWorker registration failed: ", err),
);

function random(): string | number {
	if (Math.random() < 0.5) {
		return "abc";
	} else {
		return 123;
	}
}

const { div } = tags;

function App() {
	const host = div();
	const shadow = host.element.attachShadow({ mode: "open" });
	shadow.adoptedStyleSheets.push(globalSheet, appSheet);

	shadow.append(fragment(PostForm()));

	return host;
}

const appSheet = sheet(css`
	:host {
		display: grid;
		gap: 1em;
		padding: 1em;
		grid-template-columns: minmax(0, 30em);
		justify-content: center;
	}
`);

document.body.append(App().element);
