import { computed, css, fragment, sheet, tags } from "purify-js";

import { Bytes32Hex } from "@root/common";
import { zeroPadBytes } from "ethers";
import { FeedViewer } from "~/features/post/FeedViewer";
import { PostForm } from "~/features/post/PostForm";
import { globalSheet } from "~/styles";
import { getOrRequestSigner, signer } from "~/utils/wallet";

const { div, button } = tags;

function App() {
	const host = div();
	const shadow = host.element.attachShadow({ mode: "open" });
	shadow.adoptedStyleSheets.push(globalSheet, appSheet);

	shadow.append(
		fragment(
			PostForm(),
			computed(() => {
				if (!signer.val) return null;
				const myFeedId = Bytes32Hex.parse(zeroPadBytes(signer.val.address, 32));
				return FeedViewer(myFeedId);
			}),
			button().onclick(getOrRequestSigner).textContent("Connect Wallet"),
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
