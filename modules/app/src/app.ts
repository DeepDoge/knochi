import { css, fragment, sheet, tags } from "purify-js";

import { zeroPadBytes } from "ethers";
import { PostForm } from "./libs/PostForm";
import { globalSheet } from "./styles";
import { getSigner } from "./utils/wallet";

await navigator.serviceWorker.getRegistrations().then((registrations) => {
	for (let registration of registrations) {
		registration.unregister();
	}
});

await navigator.serviceWorker.register("/sw.js").then(
	(registration) => console.log("ServiceWorker registration successful"),
	(err) => console.log("ServiceWorker registration failed: ", err),
);

const { div } = tags;

function App() {
	const host = div();
	const shadow = host.element.attachShadow({ mode: "open" });
	shadow.adoptedStyleSheets.push(globalSheet, appSheet);

	shadow.append(fragment(PostForm()));

	return host;
}

getSigner().then(async (signer) => {
	const myFeedId = zeroPadBytes(signer.address, 32);
	const response = await fetch(`/api/feed?feedId=${myFeedId}`);
	console.log(await response.json());
});

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
