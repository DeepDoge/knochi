import { css, fragment, sheet, tags } from "purify-js";

import { zeroPadBytes } from "ethers";
import { PostForm } from "./libs/PostForm";
import { globalSheet } from "./styles";
import { sw } from "./sw";
import { getSigner } from "./utils/wallet";

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
	const response = await sw.calls.getFeed(myFeedId);
	console.log(response);
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
