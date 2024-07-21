import { awaited, css, fragment, sheet, tags } from "purify-js";

import { FeedViewer } from "@/features/post/FeedViewer";
import { PostForm } from "@/features/post/PostForm";
import { globalSheet } from "@/styles";
import { getSigner } from "@/utils/wallet";
import { Bytes32Hex } from "@modules/service/types";
import { zeroPadBytes } from "ethers";

const { div } = tags;

function App() {
	const host = div();
	const shadow = host.element.attachShadow({ mode: "open" });
	shadow.adoptedStyleSheets.push(globalSheet, appSheet);

	shadow.append(
		fragment(
			PostForm(),
			awaited(
				getSigner().then((signer) => {
					const myFeedId = Bytes32Hex.parse(zeroPadBytes(signer.address, 32));
					return FeedViewer(myFeedId);
				}),
			),
		),
	);

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
